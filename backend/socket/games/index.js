// Write here your game backend

const crocodile = require('./crocodile')
const sapper = require('./sapper')
const tron = require('./tron')

const games = {
    crocodile,
    sapper,
    tron,
}

module.exports = (room, msg, userId) => {
    games[msg.name](room, msg, userId)
}
