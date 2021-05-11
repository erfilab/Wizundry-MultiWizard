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
