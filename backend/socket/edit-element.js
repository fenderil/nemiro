module.exports = (room, userId, msg) => {
    const expectedElement = room.elements.find((element) => element.id === msg.id)

    if (expectedElement) {
        if (userId === room.adminId || userId === expectedElement.authorId) {
            room.elements = room.elements.map((element) => {
                if (element.id === msg.id) {
                    borders = [msg.points[0], msg.points[1]]

                    msg.points.forEach((point) => {
                        borders[0][0] = borders[0][0] === undefined ? point[0] : Math.min(borders[0][0], point[0])
                        borders[0][1] = borders[0][1] === undefined ? point[1] : Math.min(borders[0][1], point[1])
                        borders[1][0] = borders[1][0] === undefined ? point[0] : Math.max(borders[1][0], point[0])
                        borders[1][1] = borders[1][1] === undefined ? point[1] : Math.max(borders[1][1], point[1])
                    })

                    return {
                        ...element,
                        borders,
                        points: msg.points,
                        text: msg.text
                    }
                }

                return element
            })
        }
    }
}
