// setup socket server
const Koa = require('koa');
const path = require('path');
const app = new Koa();
const server = require('http').createServer(app.callback());
const io = require('socket.io')(server, {
    cors: {
        origin: '*',
    }
});
const ss = require('@sap_oss/node-socketio-stream');
const serve = require("koa-static");
const staticDirPath = path.join(__dirname, "../client/dist");
app.use(serve(staticDirPath));


server.listen(3000, () => {
    console.log('listening on *:3000');
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

        const Speech = require('@google-cloud/speech');
        const client = new Speech.SpeechClient();

        const request = {
            config: {
                encoding: 'LINEAR16',
                sampleRateHertz: 16000,
                languageCode: 'en-US'
            },
            interimResults: false // If you want interim results, set this to true
        };

        socket.on('LANGUAGE_SPEECH', function (language) {
            console.log('set language');
            request.config.languageCode = language;
        })

        // Create a recognize stream
        const recognizeStream = client
            .streamingRecognize(request)
            .on('error', console.error)
            .on('data', data => {
                console.log(`Transcription: ${data.results[0].alternatives[0].transcript}`);
                socket.emit('SPEECH_RESULTS',(data.results[0] && data.results[0].alternatives[0])
                    ? `${data.results[0].alternatives[0].transcript}\n`
                    : `Reached_transcription_time_limit`)
            });


        ss(socket).on('START_SPEECH', stream => {
            stream.pipe(recognizeStream);
        });

        socket.on('STOP_SPEECH', function () {
            console.log('Disconnected!');
        })



        socket.on('mic', (e) => {
            console.log("Mic Event", e)
            namespaces.in(room).emit('wspeech', e)
        })
        socket.on('speaker', (e) => {
            console.log("Speaker Event", e)
            namespaces.in(room).emit('wspeaker', {
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
