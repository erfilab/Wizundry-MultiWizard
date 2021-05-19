// setup socket server
const Koa = require('koa');
const path = require('path');
const app = new Koa();
const server = require('http').createServer(app.callback());
require('dotenv').config()
const io = require('socket.io')(server, {
    cors: {
        origin: '*',
    }
});

//serve static file
const serve = require("koa-static");
const staticDirPath = path.join(__dirname, "../client/dist");
app.use(serve(staticDirPath));

//google cloud speech
const speech = require('@google-cloud/speech');
const speechClient = new speech.SpeechClient();
let recognizeStream = null;
const encoding = 'LINEAR16';
const sampleRateHertz = 16000;
const languageCode = 'en-US';
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

const HOST = process.env.HOST || "localhost";
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`listening on ${HOST}:${PORT}`);
});


// io.on('connection', (socket) => {
//     console.log("new socket connected")
//     socket.on('message', (eventData) => {
//         eventData.processed = Date.now();
//
//         // send the message back to the client
//         console.log(eventData)
//         socket.broadcast.emit('message', eventData);
//     });
// });

const namespaces = io.of(/^\/[a-zA-Z0-9_\/-]+$/)
namespaces.on('connection', socket => {
    const namespace = socket.nsp;
    const namespaceDir = namespace.name

    socket.on('joinRoom', async (room) => {
        socket.join(room);
        console.log(`connect ${namespaceDir} - ${room}`)

        //mic event
        socket.on('MICROPHONE', e => {
            namespaces.in(room).emit('WEB_RECORDING', e)
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
    })
})

function startRecognitionStream(room) {
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
            namespaces.in(room).emit("SPEECH_DATA", data);

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
