const getRandomNumber = (value) => Math.floor(Math.random() * value)

const getRandomInCollection = (collection) => collection[getRandomNumber(collection.length)]

const getOnlinePlayers = (room) => Object.values(room.users).filter(({ online }) => online)

const GAME_STATUSES = {
    start: 'start',
    steady: 'steady',
    run: 'run',
    stop: 'stop',
}

const COMMAND_STATUSES = {
    start: 'start',
    edit: 'edit',
    stop: 'stop',
}

module.exports = {
    getRandomInCollection,
    getRandomNumber,
    getOnlinePlayers,
    GAME_STATUSES,
    COMMAND_STATUSES,
}
