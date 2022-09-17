const { sendAllUpdate } = require('../update')

const getRandomNumber = (value) => Math.floor(Math.random() * value)

const getRandomInCollection = (collection) => collection[getRandomNumber(collection.length)]

const getOnlinePlayers = (room) => Object.values(room.users).filter(({ online }) => online)

const sendAll = (room) => sendAllUpdate(room, ['games'])

const GAME_STATUSES = {
    start: 'start',
    steady: 'steady',
    run: 'run',
    stop: 'stop',
}

const COMMAND_STATUSES = {
    start: 'start',
    effect: 'effect',
    stop: 'stop',
}

exports.getRandomInCollection = getRandomInCollection
exports.getRandomNumber = getRandomNumber
exports.getOnlinePlayers = getOnlinePlayers
exports.sendAll = sendAll
exports.GAME_STATUSES = GAME_STATUSES
exports.COMMAND_STATUSES = COMMAND_STATUSES
