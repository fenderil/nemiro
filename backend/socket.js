const expressWs = require('express-ws')
const { v4: uuidv4 } = require('uuid')

const rooms = require('./rooms')

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

module.exports = (app) => {    
    expressWs(app)

    app.ws('/stream/:id', (ws, req) => {
        const room = rooms.getRoom(req.params.id)
        const userId = req.cookies[req.params.id]

        if (room) {
            if (room.users[userId]) {
                room.users[userId].ws = ws
            } else {
                room.users[userId] = { ws }
            }

            ws.on('open', () => {
                sendUpdate(room, ws)
            })

            ws.on('message', (msgStr) => {
                const msg = JSON.parse(msgStr)

                console.log(req.params.id, userId, msg)

                if (msg.name) {
                    if (userId === room.adminId || room.users[userId]) {
                        room.users[userId].name = msg.name
                        room.users[userId].online = true
                    } else {
                        ws.close()
                    }
                }

                if (msg.element && msg.action === 'delete') {
                    const expectedElement = room.elements.find((element) => element.id === msg.element)

                    if (expectedElement) {
                        if (userId === room.adminId || userId === expectedElement.authorId) {
                            room.elements = room.elements.filter((element) => element.id !== msg.element)
                        }
                    }
                }

                if (['rect', 'row', 'line', 'sticker', 'text'].includes(msg.type)) {
                    room.elements.push({
                        ...msg,
                        author: room.users[userId].name,
                        authorId: userId,
                        id: uuidv4()
                    })
                }

                sendAllUpdate(room)
            })

            ws.on('close', () => {
                room.users[userId].online = false
                sendAllUpdate(room)
            })
        }
    })
}