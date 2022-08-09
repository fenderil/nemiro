const expressWs = require('express-ws')

const rooms = require('../rooms')

const startGame = require('./start-game')
const startTimer = require('./start-timer')
const stopTimer = require('./stop-timer')
const setUserName = require('./set-user-name')
const deleteElement = require('./delete-element')
const editElement = require('./edit-element')
const addElement = require('./add-element')
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

                    if (msg.type === 'game' && msg.action === 'start' && userId === room.adminId) {
                        console.log('startGame')
                        startGame(room)
                        sendAllUpdate(room, ['timer'])
                    } else if (msg.type === 'timer' && msg.action === 'start' && userId === room.adminId) {
                        console.log('startTimer')
                        startTimer(room)
                        sendAllUpdate(room, ['timer'])
                    } else if (msg.type === 'timer' && msg.action === 'stop' && userId === room.adminId) {
                        console.log('stopTimer')
                        stopTimer(room)
                        sendAllUpdate(room, ['timer'])
                    } else if (msg.name) {
                        console.log('setUserName')
                        setUserName(room, userId, msg.name)
                        sendAllUpdate(room, ['users'])
                        sendUpdate(room, ws)
                    } else if (msg.id && msg.action === 'delete') {
                        console.log('deleteElement')
                        deleteElement(room, userId, msg.id)
                        sendAllUpdate(room, ['elements'])
                    } else if (msg.id && (msg.action === 'move' || msg.action === 'edit')) {
                        console.log('editElement')
                        editElement(room, userId, msg)
                        sendAllUpdate(room, ['elements'])
                    } else if (['rect', 'row', 'line', 'sticker', 'text'].includes(msg.type) && msg.action === 'add') {
                        console.log('addElement')
                        addElement(room, userId, msg)
                        sendAllUpdate(room, ['elements'])
                    }
                })

                ws.on('close', () => {
                    console.log('disconnect')
                    room.users[userId].online = false
                    sendAllUpdate(room, ['users'])
                })
            }
        } catch (error) {
            console.error(error)
        }
    })
}