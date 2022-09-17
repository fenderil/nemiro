const { COMMAND_STATUSES } = require('../utils')
const { start } = require('./start')
const { effect } = require('./effect')

module.exports = (room, msg, userId) => {
    if (msg.action === COMMAND_STATUSES.start && userId === room.adminId) {
        start(room, msg)
    } else if (msg.action === COMMAND_STATUSES.effect) {
        effect(room, userId, msg)
    } else if (msg.action === COMMAND_STATUSES.stop) {
        clearInterval(room.gamesPrivate.tron.intervalId)
        delete room.games.tron
    }
}
