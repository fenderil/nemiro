const words = require('russian-words')

const { sendMessage, sendAllUpdate } = require('../update')

const { getRandomNumber, getRandomInCollection } = require('./utils')

const getGame = (gameIndex, onlineUsers) => {
    switch (gameIndex) {
    case 0: {
        return getRandomInCollection(onlineUsers).name
    }
    case 1: {
        return getRandomInCollection(words)
    }
    default: {
        return 'No crocodile game, sorry'
    }
    }
}

const removeRandomUserAndSendRandomName = (room, gameIndex, onlineUsers, players) => {
    const [master] = players.splice(getRandomNumber(players.length), 1)

    sendMessage(master.ws, {
        games: {
            ...room.games,
            crocodile: getGame(gameIndex, onlineUsers),
        },
    })
}

module.exports = (room, msg, userId) => {
    if (msg.action === 'start' && userId === room.adminId) {
        const onlineUsers = Object.values(room.users)
            .filter(({ online }) => online)
        const players = [...onlineUsers]
        const userCounts = onlineUsers.length
        const gameIndex = getRandomNumber(2)

        removeRandomUserAndSendRandomName(room, gameIndex, onlineUsers, players)

        if (userCounts > 3) {
            removeRandomUserAndSendRandomName(room, gameIndex, onlineUsers, players)
        }

        if (!room.timer) {
            room.timer = {}
        }
        room.timer.id = (room.timer.id || 0) + 1
        room.timer.from = Number(new Date())
        room.timer.duration = 10
        room.timer.action = 'start'

        sendAllUpdate(room, ['timer'])
    } else if (msg.action === 'stop') {
        delete room.games.crocodile
    }
}
