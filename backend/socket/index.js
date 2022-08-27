const expressWs = require('express-ws')

const rooms = require('../rooms')

const startGame = require('./start-game')
const startTimer = require('./start-timer')
const stopTimer = require('./stop-timer')
const setUserName = require('./set-user-name')
const deleteElement = require('./delete-element')
const editElement = require('./edit-element')
const addElement = require('./add-element')
const setUserCursor = require('./set-user-cursor')
const { startSapperGame, editSapperGame } = require('./sapper-game')
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
                        console.log('cursor')
                        setUserCursor(room, userId, msg.cursor)
                        sendAllUpdate(room, ['users'])
                    } else if (msg.type === 'game' && msg.action === 'start' && userId === room.adminId) {
                        console.log('startGame')
                        startGame(room)
                        sendAllUpdate(room, ['timer'])
                    } else if (msg.type === 'sapperGame' && msg.action === 'start' && userId === room.adminId) {
                        console.log('startSapperGame')
                        startSapperGame(room)
                        sendAllUpdate(room, ['sapper'])
                    } else if (msg.type === 'sapperGame' && msg.action === 'edit') {
                        console.log('editSapperGame')
                        editSapperGame(room, userId, msg)
                        sendAllUpdate(room, ['sapper'])
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
                    } else if (msg.id && (['move', 'edit', 'resize'].includes(msg.action))) {
                        if (msg.action === 'edit' && ['sticker', 'text'].includes(msg.type) && msg.text === '') {
                            console.log('deleteElement by removing text')
                            deleteElement(room, userId, msg.id)
                            sendAllUpdate(room, ['elements'])
                        } else {
                            console.log('editElement')
                            editElement(room, userId, msg)
                            sendAllUpdate(room, ['elements'])
                        }
                    } else if (['rect', 'row', 'line', 'sticker', 'text', 'image'].includes(msg.type) && msg.action === 'add') {
                        if (['sticker', 'text'].includes(msg.type) && msg.text === '') {

                        } else {
                            console.log('addElement')
                            addElement(room, userId, msg)
                            sendAllUpdate(room, ['elements'])
                        }
                    }
                })

                ws.on('close', () => {
                    console.log('disconnect')
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
