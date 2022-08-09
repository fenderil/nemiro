const sendMessage = (ws, data) => {
    ws.send(JSON.stringify(data))
}

const sendUpdate = ({ adminId, ...room }, ws, context) => {
    let data = {}
    
    const cleanUsers = Object.values(room.users).map(({ ws, ...rest }) => rest)
    const cleanElements = room.elements.map(({ authorId, ...rest }) => rest)

    if (context) {
        context.forEach((contextName) => {
            if (contextName === 'users') {
                data[contextName] = cleanUsers
            } else if (contextName === 'elements') {
                data[contextName] = cleanElements
            } else {
                data[contextName] = room[contextName]
            }
        })
    } else {
        data = { ...room, users: cleanUsers, elements: cleanElements, adminId: '' }
    }

    sendMessage(ws, data)
}

const sendAllUpdate = (room, context) => {
    Object.values(room.users).forEach(({ ws }) => {
        if (ws) {
            sendUpdate(room, ws, context)
        }
    })
}

module.exports = {
    sendMessage,
    sendUpdate,
    sendAllUpdate
}
