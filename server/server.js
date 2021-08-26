const express = require("express");
const cors = require("cors");
const path = require('path');

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
    if(err) console.log('Error when creating user table ', err)
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
    if(err) console.log('Error when creating logs table ', err)
    else console.log('Logs table created: ', res.info)
})

const routes = require('./routes/index')
app.use('/', routes)


const HOST = process.env.HOST || "localhost";
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
    console.log(`env: ${process.env.NODE_ENV}\nlistening on ${HOST}:${PORT}`);
});
const { Server } = require('socket.io');
const io = new Server(server, { cors: { origin: '*' }});

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

const namespaces = io.of(/^\/[a-zA-Z0-9_\/-]+$/)
namespaces.on('connection', socket => {
    const namespace = socket.nsp;
    const namespaceDir = namespace.name

    socket.on('joinRoom', async (room) => {
        socket.join(room);
        console.log(`connect ${namespaceDir} - ${room}`)


        // multi-wizard speaker event
        socket.on('SPEAK', async (data) => {
            console.log(`SPEAKER_EVENT ${data.id}: ${data.content}`)
            if (data.content) namespaces.in(room).emit("START_SPEAKER", {...data});
            else namespaces.in(room).emit("END_SPEAKER", '');
        });


        //mic event
        socket.on('MICROPHONE', e => {
            namespaces.in(room).emit('WEB_RECORDING', e.status)
        })

        socket.on('startGoogleCloudStream', uid => {
            if (uid) sender_uid = uid
            startRecognitionStream(room, sender_uid);
        });

        socket.on('endGoogleCloudStream', () => {
            stopRecognitionStream();
        });

        socket.on('BINARY_DATA', data => {
            if (recognizeStream !== null) {
                recognizeStream.write(data);
            }
        });
        socket.on('HIGHLIGHT', e => {
            console.log("Highlight Event", e)
            namespaces.in(room).emit('AUTO_HIGHLIGHT', {status: e})
        });
        socket.on('SPEAKER', (e) => {
            console.log("Speaker Event", e)
            namespaces.in(room).emit('WEB_SPEAKER', {
                status: e.status,
                start: e.start
            })
        })
        socket.on('msg', e => {
            console.log('mess', e)
            namespaces.in(room).emit('message', {...e})
        })

        socket.on('sendMessage', e => {
            console.log('sendMessage', e)
            namespaces.in(room).emit('MESSAGE', e)
        })

        socket.on('playMessage', e => {
            console.log('playMessage', e)
            namespaces.in(room).emit('PLAY_MESSAGE', e)
        })
    })
})

function startRecognitionStream(room, uid) {
    console.log("SSR", room)
    recognizeStream = speechClient
        .streamingRecognize(request)
        .on('error', console.error)
        .on('data', data => {
            // console.log(`Transcription: ${data.results[0].alternatives[0].transcript}`);
            process.stdout.write(
                data.results[0] && data.results[0].alternatives[0]
                    ? `Transcription: ${data.results[0].alternatives[0].transcript}\n`
                    : '\n\nReached transcription time limit, press Ctrl+C\n'
            );
            // console.log("DATA", data)
            namespaces.in(room).emit("SPEECH_DATA", {data: data, uid: uid});

            if (data.results[0] && data.results[0].isFinal) {
                stopRecognitionStream();
                startRecognitionStream(room, sender_uid);
                console.log('Restarted Stream on Serverside');
            }
        });
}

function stopRecognitionStream() {
    console.log("CSR")
    if (recognizeStream) recognizeStream.end();
    recognizeStream = null;
}
