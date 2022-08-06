const path = require('path')

const express = require('express')
const cookieParser = require('cookie-parser')

const rooms = require('./rooms')
const socket = require('./socket')

const app = express()

app.use(cookieParser())

app.post('/room/create', (req, res) => {
    const adminId = rooms.createAdmin()
    const roomId = rooms.createRoom(adminId)
    
    res.cookie(roomId, adminId, { httpOnly: true })
    res.send({ roomId })
})

app.get('/room/create', (req, res) => {
    res.sendFile(path.resolve(process.cwd(), 'frontend', 'static', 'create-room.html'))
})

app.get('/room/:id', (req, res) => {
    if (rooms.getRoom(req.params.id)) {
        let userId = req.cookies[req.params.id]
        if (!userId) {
            userId = rooms.createUser(req.params.id)
            res.cookie(req.params.id, userId, { httpOnly: true })
        }
        res.sendFile(path.resolve(process.cwd(), 'frontend', 'static', 'room.html'))
    } else {
        res.redirect('/room/create')
    }
})

app.get('/room/check', (req, res) => {
    res.send(rooms.getAllRooms())
})
app.get('/room/:id/users', (req, res) => {
    const room = rooms.getRoom(req.params.id)
    if (room) {
        res.send(room)
    } else {
        res.send(404)
    }
})


socket(app)

app.use('*', (req, res) => {
    res.send(404)
})

app.listen(process.env.PORT || 8000, () => {
    console.log(`started on ${process.env.PORT || 8000}`)
})