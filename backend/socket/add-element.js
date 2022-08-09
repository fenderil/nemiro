const { v4: uuidv4 } = require('uuid')

module.exports = (room, userId, { action, ...msg }) => {
    if (msg.type === 'rect') {
        const minX = Math.min(msg.points[0][0], msg.points[1][0])
        const minY = Math.min(msg.points[0][1], msg.points[1][1])
        const maxX = Math.max(msg.points[0][0], msg.points[1][0])
        const maxY = Math.max(msg.points[0][1], msg.points[1][1])
        msg.points = [[minX, minY], [maxX, maxY]]
    }
    room.elements.push({
        ...msg,
        author: room.users[userId].name,
        authorId: userId,
        id: uuidv4()
    })
}
