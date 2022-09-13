const getRandomNumber = (value) => Math.floor(Math.random() * value)

const getRandomInCollection = (collection) => collection[getRandomNumber(collection.length)]

const getOnlinePlayers = (room) => Object.values(room.users).filter(({ online }) => online)

const GAME_STATUSES = {
    START: 'start',
    STEADY: 'steady',
    RUN: 'run',
    STOP: 'stop',
}

const COMMAND_STATUSES = {
    START: 'start',
    EDIT: 'edit',
    STOP: 'stop',
}

module.exports = {
    getRandomInCollection,
    getRandomNumber,
    getOnlinePlayers,
    GAME_STATUSES,
    COMMAND_STATUSES,
}
