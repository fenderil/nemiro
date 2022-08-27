const path = require('path')

const express = require('express')
const cookieParser = require('cookie-parser')

const rooms = require('./rooms')
const socket = require('./socket')
const { setAdminCookie, setIsAdminCookie, setUserCookie } = require('./cookies')

const app = express()

app.use(cookieParser())

socket(app)

app.get('/worker.js', (req, res) => {
  res.sendFile(path.resolve(process.cwd(), 'frontend', 'static', 'worker.js'))
})

app.get('/', (req, res) => {
  res.sendFile(path.resolve(process.cwd(), 'frontend', 'templates', 'index.html'))
})

app.get('/getRooms', (req, res) => {
  res.send(rooms.getOwnRooms(req.cookies))
})

app.get('/room/create', (req, res) => {
  res.sendFile(path.resolve(process.cwd(), 'frontend', 'templates', 'create-room.html'))
})

app.post('/room/create', (req, res) => {
  const adminId = rooms.createAdmin()
  const roomId = rooms.createRoom(adminId)

  setAdminCookie(res, roomId, adminId)
  setIsAdminCookie(res, roomId)
  res.send({ roomId })
})

app.get('/room/:id', (req, res) => {
  const roomId = req.params.id
  if (rooms.getRoom(roomId)) {
    let userId = req.cookies[roomId]
    if (!userId) {
      userId = rooms.createUser()
      setUserCookie(res, roomId, userId)
    }
    res.sendFile(path.resolve(process.cwd(), 'frontend', 'templates', 'room.html'))
  } else {
    res.redirect('/')
  }
})

app.use('/static', express.static(path.resolve(process.cwd(), 'frontend', 'static')))

app.use('*', (req, res) => {
  res.send(404)
})

app.listen(process.env.PORT || 8000, () => {
  console.log(`started on ${process.env.PORT || 8000}`)
})
