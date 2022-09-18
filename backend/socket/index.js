const expressWs = require('express-ws')

const rooms = require('../rooms')

const startTimer = require('./start-timer')
const stopTimer = require('./stop-timer')
const setUserName = require('./set-user-name')
const deleteElement = require('./delete-element')
const editElement = require('./edit-element')
const addElement = require('./add-element')
const setUserCursor = require('./set-user-cursor')
const startGame = require('./games')
const { sendAllUpdate, sendUpdate } = require('./update')

const connectUser = (room, userId, ws) => {
    if (room.users[userId]) {
        room.users[userId].ws = ws
    } else {
        room.users[userId] = { ws }
    }
}

module.exports = (app) => {
    expressWs(app)

    app.ws('/stream/:id', (ws, req) => {
        try {
            const room = rooms.getRoom(req.params.id)
            const userId = req.cookies[req.params.id]

            if (room) {
                connectUser(room, userId, ws)

                ws.on('message', (msgStr) => {
                    const msg = JSON.parse(msgStr)

                    console.log('Room:', req.params.id)
                    console.log('User:', userId)
                    console.log('Message: ', msg)

                    if (msg.type === 'cursor' && msg.cursor) {
                        setUserCursor(room, userId, msg.cursor)
                        sendAllUpdate(room, ['users'])
                    } else if (msg.type === 'game') {
                        startGame(room, msg, userId)
                    } else if (msg.type === 'timer' && msg.action === 'start' && userId === room.adminId) {
                        startTimer(room)
                        sendAllUpdate(room, ['timer'])
                    } else if (msg.type === 'timer' && msg.action === 'stop' && userId === room.adminId) {
                        stopTimer(room)
                        sendAllUpdate(room, ['timer'])
                    } else if (msg.name) {
                        setUserName(room, userId, msg.name)
                        sendAllUpdate(room, ['users'])
                        sendUpdate(room, ws)
                    } else if (msg.id && msg.action === 'delete') {
                        deleteElement(room, userId, msg.id)
                        sendAllUpdate(room, ['elements'])
                    } else if (msg.id && (['move', 'edit', 'resize', 'like', 'dislike'].includes(msg.action))) {
                        if (msg.action === 'edit' && ['sticker', 'text'].includes(msg.type) && msg.text === '') {
                            deleteElement(room, userId, msg.id)
                            sendAllUpdate(room, ['elements'])
                        } else {
                            editElement(room, userId, msg)
                            sendAllUpdate(room, ['elements'])
                        }
                    } else if (['rect', 'row', 'line', 'sticker', 'text', 'image'].includes(msg.type) && msg.action === 'add') {
                        if (!(['sticker', 'text'].includes(msg.type) && msg.text === '')) {
                            addElement(room, userId, msg)
                            sendAllUpdate(room, ['elements'])
                        }
                    }
                })

                ws.on('close', () => {
                    console.log(`Disconnect: ${userId}`)
                    room.users[userId].online = false
                    delete room.users[userId].cursor
                    sendAllUpdate(room, ['users'])
                })
            }
        } catch (error) {
            console.error(error)
        }
    })
}
