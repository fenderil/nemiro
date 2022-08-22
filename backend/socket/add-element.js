const { v4: uuidv4 } = require('uuid')

module.exports = (room, userId, { action, ...msg }) => {
    borders = [msg.points[0], msg.points[1]]

    if (msg.type === 'rect') {
        const minX = Math.min(msg.points[0][0], msg.points[1][0])
        const minY = Math.min(msg.points[0][1], msg.points[1][1])
        const maxX = Math.max(msg.points[0][0], msg.points[1][0])
        const maxY = Math.max(msg.points[0][1], msg.points[1][1])
        msg.points = [[minX, minY], [maxX, maxY]]
    }

    msg.points.forEach((point) => {
        borders[0][0] = borders[0][0] === undefined ? point[0] : Math.min(borders[0][0], point[0])
        borders[0][1] = borders[0][1] === undefined ? point[1] : Math.min(borders[0][1], point[1])
        borders[1][0] = borders[1][0] === undefined ? point[0] : Math.max(borders[1][0], point[0])
        borders[1][1] = borders[1][1] === undefined ? point[1] : Math.max(borders[1][1], point[1])
    })

    room.elements.push({
        ...msg,
        author: room.users[userId].name,
        authorId: userId,
        borders,
        id: uuidv4()
    })
}
