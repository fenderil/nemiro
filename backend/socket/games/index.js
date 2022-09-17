const crocodile = require('./crocodile')
const sapper = require('./sapper')
const tron = require('./tron')
const tetris = require('./tetris')

const games = {
    crocodile,
    sapper,
    tron,
    tetris,
}

module.exports = (room, msg, userId) => {
    games[msg.name](room, msg, userId)
}
