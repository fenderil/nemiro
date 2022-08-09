module.exports = (room, userId, msg) => {
    const expectedElement = room.elements.find((element) => element.id === msg.id)

    if (expectedElement) {
        if (userId === room.adminId || userId === expectedElement.authorId) {
            room.elements = room.elements.map((element) => {
                if (element.id === msg.id) {
                    return {
                        ...element,
                        points: msg.points,
                        text: msg.text
                    }
                }

                return element
            })
        }
    }
}
