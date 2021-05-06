// setup socket server

const fs = require('fs')
const Step = require('prosemirror-transform').Step
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

const schema = require('./schema.js')

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

const simulateSlowServerDelay = 0 // milliseconds
const dbPath = './db'
const docTrailer = '-db.json'
const lockedTrailer = '-db_locked.json'
const stepsTrailer = '-db_steps.json'
const maxStoredSteps = 1000
const defaultData = {
    "version": 0,
    "doc": { "type": "doc", "content": [{ "type": "paragraph", "content":[{ "type": "text", "text": "Let's start collaborating. Yeah!" }] }] }
}

const sleep = (ms) => (new Promise(resolve => setTimeout(resolve, ms)));

function initProjectDir(namespaceDir) {
    if (!fs.existsSync(dbPath + namespaceDir)){
        fs.mkdirSync(dbPath + namespaceDir, { recursive: true })
    }
}

function storeDoc(data, namespaceDir, roomName) {
    fs.writeFileSync(dbPath + namespaceDir + '/' + roomName + docTrailer, JSON.stringify(data, null, 2))
}

function storeSteps({steps, version}, namespaceDir, roomName) {
    let limitedOldData = []
    try {
        const oldData = JSON.parse(fs.readFileSync(dbPath + namespaceDir + '/' + roomName + stepsTrailer, 'utf8'))
        limitedOldData = oldData.slice(Math.max(oldData.length - maxStoredSteps))
    } catch(e) {
    }

    const newData = [
        ...limitedOldData,
        ...steps.map((step, index) => {
            return {
                step: JSON.parse(JSON.stringify(step)),
                version: version + index + 1,
                clientID: step.clientID,
            }
        })
    ]

    fs.writeFileSync(dbPath + namespaceDir + '/' + roomName + stepsTrailer, JSON.stringify(newData))
}

function storeLocked(locked, namespaceDir, roomName) {
    fs.writeFileSync(dbPath + namespaceDir + '/' + roomName + lockedTrailer, locked.toString())
}

function getDoc(namespaceDir, roomName) {
    try {
        return JSON.parse(fs.readFileSync(dbPath + namespaceDir + '/' + roomName + docTrailer, 'utf8'))
    } catch(e) {
        return defaultData
    }
}

function getLocked(namespaceDir, roomName) {
    try {
        return JSON.parse(fs.readFileSync(dbPath + namespaceDir + '/' + roomName + lockedTrailer, 'utf8'))
    } catch(e) {
        return false
    }
}

function getSteps(version, namespaceDir, roomName) {
    try {
        const steps = JSON.parse(fs.readFileSync(dbPath + namespaceDir + '/' + roomName + stepsTrailer, 'utf8'))
        return steps.filter(step => step.version > version)
    } catch(e) {
        return []
    }
}

const namespaces = io.of(/^\/[a-zA-Z0-9_\/-]+$/)

namespaces.on('connection', socket => {
    const namespace = socket.nsp;
    const namespaceDir = namespace.name

    initProjectDir(namespaceDir)

    socket.on('joinRoom', async (room) => {
        socket.join(room);
        console.log(`connect ${namespaceDir} - ${room}`)

        socket.on('update', async ({ version, clientID, steps }) => {
            // we need to check if there is another update processed
            const locked = getLocked(namespaceDir, room)
            // so we store a "locked" state
            console.log(getSteps(version, namespaceDir, room))

            if (locked) {
                // we will do nothing and wait for another client update
                return
            }

            storeLocked(true, namespaceDir, room)

            const storedData = getDoc(namespaceDir, room)

            await sleep(simulateSlowServerDelay)

            // version mismatch: the stored version is newer
            // so we send all steps of this version back to the user
            if (storedData.version !== version) {
                namespace.in(room).emit('update', {
                    version,
                    steps: getSteps(version, namespaceDir, room),
                })
                storeLocked(false, namespaceDir, room)
                return
            }

            let doc = schema.nodeFromJSON(storedData.doc)

            await sleep(simulateSlowServerDelay)

            let newSteps = steps.map(step => {
                const newStep = Step.fromJSON(schema, step)
                newStep.clientID = clientID

                // apply step to document
                let result = newStep.apply(doc)
                doc = result.doc

                return newStep
            })

            await sleep(simulateSlowServerDelay)

            // calculating a new version number is easy
            const newVersion = version + newSteps.length

            // store data
            storeSteps({ version, steps: newSteps }, namespaceDir, room)
            storeDoc({ version: newVersion, doc }, namespaceDir, room)

            await sleep(simulateSlowServerDelay)

            console.log(getSteps(version, namespaceDir, room))
            // send update to everyone (me and others)
            namespace.in(room).emit('update', {
                version: newVersion,
                steps: getSteps(version, namespaceDir, room),
            })

            storeLocked(false, namespaceDir, room)
        })

        // send latest document
        namespace.in(room).emit('init', getDoc(namespaceDir, room))

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
