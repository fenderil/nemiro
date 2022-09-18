module.exports = (room, userId, msg) => {
    const expectedElement = room.elements.find((element) => element.id === msg.id)

    if (expectedElement) {
        if (msg.action === 'like' || msg.action === 'dislike') {
            if (msg.action === 'like') {
                expectedElement.likes.push(userId)
            } else if (msg.action === 'dislike') {
                expectedElement.dislikes.push(userId)
            }
        } else if (userId === room.adminId || userId === expectedElement.authorId) {
            const borders = [[msg.points[0][0], msg.points[0][1]], [msg.points[1][0], msg.points[1][1]]]

            msg.points.forEach((point) => {
                borders[0][0] = borders[0][0] === undefined ? point[0] : Math.min(borders[0][0], point[0])
                borders[0][1] = borders[0][1] === undefined ? point[1] : Math.min(borders[0][1], point[1])
                borders[1][0] = borders[1][0] === undefined ? point[0] : Math.max(borders[1][0], point[0])
                borders[1][1] = borders[1][1] === undefined ? point[1] : Math.max(borders[1][1], point[1])
            })

            Object.assign(
                expectedElement,
                {
                    borders,
                    color: msg.color,
                    points: msg.points,
                    text: msg.text,
                },
            )
        }
    }
}
