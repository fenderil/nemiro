// Write here your game backend

const crocodile = require('./crocodile')
const sapper = require('./sapper')

const games = {
    crocodile,
    sapper
}

module.exports = (room, msg, userId) => {
    games[msg.name](room, msg, userId)
}
