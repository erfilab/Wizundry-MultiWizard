// setup socket server
const fs = require('fs')
const { Step } = require('prosemirror-model')
const { join } = require('path')
const { disconnect } = require('process')

// import schema from './schema.js'
const Koa = require('koa');
const app = new Koa();
const server = require('http').createServer(app.callback());
const io = require('socket.io')(server, {
    cors: {
        origin: '*',
    }
});

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

        socket.on('update', async ({ version, clientID, steps }) => {
            console.log("UPDATE from server : ",
                version, clientID, steps)
            namespace.in(room).emit('update', {
                version,
                steps: steps
            })
        })

        // send latest document
        namespace.in(room).emit('init', room)

        // send client count
        if (namespace.adapter.rooms[room])
            namespace.in(room).emit('getCount', namespace.adapter.rooms[room].length)
        socket.on('disconnect', () => {
            if (namespace.adapter.rooms[room]) {
                namespace.in(room).emit('getCount', namespace.adapter.rooms[room].length)
            }
        })
    })
})