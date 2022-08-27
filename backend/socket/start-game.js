const words = require('russian-words')

const { sendMessage } = require('./update')

const getGame = (room, gameIndex, collection) => {
    switch (gameIndex) {
    case 0: {
        const wordIndex = Math.floor(Math.random() * collection.length)
        return Object.values(room.users)[wordIndex].name
    }
    case 1: {
        const wordIndex = Math.floor(Math.random() * words.length)
        return words[wordIndex]
    }
    default: {
        return 'No game, sorry'
    }
    }
}

const removeRandomUserAndSendRandomName = (room, gameIndex, collection) => {
    const masterIndex = Math.floor(Math.random() * collection.length)
    const [master] = collection.splice(masterIndex, 1)

    sendMessage(master.ws, {
        game: getGame(room, gameIndex, collection),
    })
}

module.exports = (room) => {
    const usersSockets = Object.values(room.users).filter((user) => user.name)
    const userCounts = usersSockets.length
    const gameIndex = Math.floor(Math.random() * 2)

    removeRandomUserAndSendRandomName(room, gameIndex, usersSockets)

    if (userCounts > 3) {
        removeRandomUserAndSendRandomName(room, gameIndex, usersSockets)
    }

    if (!room.timer) {
        room.timer = {}
    }
    room.timer.id = (room.timer.id || 0) + 1
    room.timer.from = Number(new Date())
    room.timer.duration = 10
    room.timer.action = 'start'
}
