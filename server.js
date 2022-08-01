const path = require('path')

const { v4: uuidv4 } = require('uuid')
const app = require('express')()
require('express-ws')(app)

const cookieParser = require('cookie-parser')

const rooms = {}

app.use(cookieParser())

app.get('/room/create', (req, res) => {
    res.sendFile(path.resolve(process.cwd(), 'src', 'create-room.html'))
})
app.get('/room/:id', (req, res) => {
    if (rooms[req.params.id]) {
        const userId = req.cookies[req.params.id]
        if (!userId) {
            const newUser = uuidv4()
            res.cookie(req.params.id, newUser, { httpOnly: true })
            rooms[req.params.id].users[newUser] = {}
        }
        res.sendFile(path.resolve(process.cwd(), 'src', 'room.html'))
    } else {
        res.redirect('/room/create')
    }
})
app.get('/room/:id/users', (req, res) => {
    if (rooms[req.params.id]) {
        res.send(rooms[req.params.id])
    } else {
        res.send(404)
    }
})
app.post('/room/create', (req, res) => {
    const roomId = uuidv4()
    const adminId = uuidv4()
    res.cookie(roomId, adminId, { httpOnly: true })

    rooms[roomId] = {
        adminId,
        users: {},
        elements: []
    }

    res.send({ roomId })
})

const sendUpdate = (room, ws) => {
    const cleanUsers = Object.values(room.users).map(({ ws, ...rest }) => rest)
    const cleanRoom = { ...room, users: cleanUsers }
    ws.send(JSON.stringify(cleanRoom))
}

const sendAllUpdate = (room) => {
    Object.values(room.users).forEach(({ ws }) => {
        sendUpdate(room, ws)
    })
}

app.ws('/stream/:id', (ws, req) => {
    const room = rooms[req.params.id]
    const userId = req.cookies[req.params.id]

    if (room) {
        room.users[userId] = { ws }

        ws.on('open', () => {
            sendUpdate(room, ws)
        })

        ws.on('message', (msgStr) => {
            const msg = JSON.parse(msgStr)

            if (msg.name) {
                if (userId === room.adminId || room.users[userId]) {
                    room.users[userId].name = msg.name
                    room.users[userId].online = true
                } else {
                    ws.close()
                }
            }

            // TODO: обновление графики

            sendAllUpdate(room)
        })

        ws.on('close', () => {
            room.users[userId].online = false
            sendAllUpdate(room)
        })
    }
})






app.use('*', (req, res) => {
    res.send(404)
})

app.listen(process.env.PORT || 8000, () => {
    console.log(`started on ${process.env.PORT || 8000}`)
})