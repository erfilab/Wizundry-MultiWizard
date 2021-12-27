const express = require("express");
const cors = require("cors");
const path = require('path');

if (!process.env.NODE_ENV) process.env.NODE_ENV = 'production';
// env mode = [0, 1, 2]
const env_modes = ['localhost', 'development', 'production']
const configuration = [{
    name: 'localhost',
    env_file: './.env',
    static_dir: '../platform/dist',
}, {
    name: 'development',
    env_file: './dev.env',
    static_dir: './platform/dist',
}, {
    name: 'production',
    env_file: './prod.env',
    static_dir: '../platform/dist',
}];
const env_mode = env_modes.indexOf(process.env.NODE_ENV);
const cfg = configuration[env_mode];

require('dotenv').config({ path: path.join(__dirname, cfg.env_file) });

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const routes = require('./routes/index')
app.use('/', routes)

app.use(
    express.static(
        path.join(
            __dirname,
            `${process.env.NODE_ENV === 'development' ? '.' : '..'}/platform/dist`
        )
    )
);

app.use(
    '*',
    express.static(
        path.join(
            __dirname,
            `${process.env.NODE_ENV === 'development' ? '.' : '..'}/platform/dist`
        )
    )
);

const sql = require("./models/db.js");
sql.query("CREATE TABLE IF NOT EXISTS `user_info` (\n" +
    "\t`id` BIGINT(20) NOT NULL AUTO_INCREMENT,\n" +
    "\t`uid` VARCHAR(64) NOT NULL DEFAULT '' COLLATE 'latin1_swedish_ci',\n" +
    "\t`password` VARCHAR(64) NOT NULL DEFAULT '' COLLATE 'latin1_swedish_ci',\n" +
    "\t`username` VARCHAR(64) NOT NULL COLLATE 'latin1_swedish_ci',\n" +
    "\t`roles` VARCHAR(64) NOT NULL COLLATE 'latin1_swedish_ci',\n" +
    "\t`token` VARCHAR(128) NULL COLLATE 'latin1_swedish_ci',\n" +
    "\t`createdAt` BIGINT(20) NOT NULL,\n" +
    "\tPRIMARY KEY (`id`) USING BTREE\n" +
    ")\n" +
    "ENGINE=InnoDB;", (err, res) => {
        if (err) console.log('Error when creating user table ', err)
        else console.log('User table created: ', res.info)
    })

sql.query("CREATE TABLE IF NOT EXISTS `multi_doc_logs` (\n" +
    "\t`id` BIGINT(20) NOT NULL AUTO_INCREMENT,\n" +
    "\t`username` VARCHAR(64) NOT NULL COLLATE 'latin1_swedish_ci',\n" +
    "\t`timestamp` TIMESTAMP NULL,\n" +
    "\t`type` VARCHAR(32) NULL COLLATE 'latin1_swedish_ci',\n" +
    "\t`value` TEXT NULL COLLATE 'latin1_swedish_ci',\n" +
    "\t`status` TINYINT(2) NULL,\n" +
    "\tPRIMARY KEY (`id`) USING BTREE\n" +
    ")\n" +
    "ENGINE=InnoDB;", (err, res) => {
        if (err) console.log('Error when creating logs table ', err)
        else console.log('Logs table created: ', res.info)
    })

sql.query(`CREATE TABLE IF NOT EXISTS experiment (
        id BIGINT(20) NOT NULL AUTO_INCREMENT,
        project_name VARCHAR(50) NOT NULL COLLATE 'latin1_swedish_ci',
        type VARCHAR(50) NULL COLLATE 'latin1_swedish_ci',
        division VARCHAR(50) NULL COLLATE 'latin1_swedish_ci',
        features VARCHAR(256) NULL COLLATE 'latin1_swedish_ci',
        confirm TINYINT(2) NULL,
        username VARCHAR(64) NOT NULL COLLATE 'latin1_swedish_ci',
        created_at TIMESTAMP NULL,
        PRIMARY KEY(id) USING BTREE
    ) ENGINE = InnoDB`, (err, res) => {
        if (err) console.log('Error when creating experiment table ', err)
        else console.log('Experiment table created: ', res.info)
    })


const HOST = process.env.HOST || "localhost";
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
    console.log(`env: ${process.env.NODE_ENV}\nlistening on ${HOST}:${PORT}`);
});
const { Server } = require('socket.io');
const io = new Server(server, { cors: { origin: '*' } });

//google cloud speech
const speech = require('@google-cloud/speech');
const speechClient = new speech.SpeechClient();
let recognizeStream = null;
const encoding = 'LINEAR16';
const sampleRateHertz = 16000;
const languageCode = 'en-US';
let sender_uid = '';

const request = {
    config: {
        encoding: encoding,
        sampleRateHertz: sampleRateHertz,
        languageCode: languageCode,
        profanityFilter: false,
        enableWordTimeOffsets: true,
        enableAutomaticPunctuation: true,
        // speechContexts: [{
        //     phrases: ["hoful","shwazil"]
        //    }] // add your own speech context for better recognition
    },
    interimResults: true, // If you want interim results, set this to true
};
const Log = require('./models/log');

const createNewLog = (log) => {
    const params = {
        experiment_id: log.experiment_id,
        project_name: log.project_name,
        username: log.username || "",
        timestamp: new Date().toISOString().slice(0, 19).replace("T", " "),
        type: log.type || "",
        status: log.status || false,
        value: log.value || "",
    };

    Log.create(params, (err, log) => {
        if (err) console.log(err)
        else console.log("Log created: ", log)
    })
}

const namespaces = io.of(/^\/[a-zA-Z0-9_\/-]+$/)
namespaces.on('connection', socket => {
    const namespace = socket.nsp;
    const namespaceDir = namespace.name

    socket.on('joinRoom', async (room) => {
        socket.join(room);
        console.log(`connect ${namespaceDir} - ${room}`)

        // microphone recording event
        socket.on('MICROPHONE', async e => {
            // await createNewLog({
            //     experiment_id: e.experiment_id,
            //     project_name: e.project_name,
            //     username: e.username,
            //     type: "MICROPHONE",
            //     status: e.status,
            // })
            namespaces.in(room).emit('WEB_RECORDING', e.status)
        })

        socket.on('startGoogleCloudStream', () => {
            startRecognitionStream(room);
        });

        socket.on('endGoogleCloudStream', () => {
            stopRecognitionStream();
        });

        socket.on('BINARY_DATA', data => {
            if (recognizeStream !== null) {
                recognizeStream.write(data);
            }
        });


        // speaker event
        socket.on('SPEAKER', (e) => {
            console.log("Speaker Event", e.type, ': ', e.content)
            namespaces.in(room).emit('WEB_SPEAKER', { ...e })
        })

        // note
        socket.on('ADD_NOTE', e => {
            console.log("Add Note", e.uuid, ': ', e.note.content)
            namespaces.in(room).emit('NOTE_ADDED', { ...e })
        })

        socket.on('REMOVE_NOTE', uuid => {
            console.log("Remove Note", uuid)
            namespaces.in(room).emit('NOTE_REMOVED', uuid)
        })

        //cursor event
        // socket.on('CURSOR_POS', e => {
        //     namespaces.in(room).emit('CURSOR_POSITION', e)
        // })
    })
})

function startRecognitionStream(room) {
    console.log("SSR", room)
    recognizeStream = speechClient
        .streamingRecognize(request)
        .on('error', console.error)
        .on('data', data => {
            console.log(`Transcription: ${data.results[0].alternatives[0].transcript}`);
            // process.stdout.write(
            //     data.results[0] && data.results[0].alternatives[0]
            //         ? `Transcription: ${data.results[0].alternatives[0].transcript}\n`
            //         : '\n\nReached transcription time limit, press Ctrl+C\n'
            // );
            // console.log("DATA", data)
            namespaces.in(room).emit("SPEECH_DATA", { ...data });

            if (data.results[0] && data.results[0].isFinal) {
                stopRecognitionStream();
                startRecognitionStream(room);
                console.log('Restarted Stream on Serverside');
            }
        });
}

function stopRecognitionStream() {
    console.log("CSR")
    if (recognizeStream) recognizeStream.end();
    recognizeStream = null;
}
