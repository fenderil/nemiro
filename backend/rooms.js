const { v4: uuidv4 } = require('uuid')

const rooms = {}

module.exports = {
    getAllRooms () {
        return Object.keys(rooms)
    },
    getRoom (roomId) {
        if (rooms[roomId]) {
            return rooms[roomId]
        } else {
            console.error('No room by id', roomId)
        }
    },
    getOwnRooms (adminId) {
        return Object.keys(rooms).filter((roomId) => rooms[roomId].adminId = adminId)
    },
    createRoom (adminId) {
        const roomId = uuidv4()

        rooms[roomId] = {
            adminId,
            users: {},
            elements: []
        }

        return roomId
    },
    createAdmin () {
        return uuidv4()
    },
    createUser (roomId) {
        const userId = uuidv4()
        rooms[roomId].users[userId] = {}
        return userId
    }
}

