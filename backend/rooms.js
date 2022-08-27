const { v4: uuidv4 } = require('uuid')

const rooms = {}

module.exports = {
    getAllRooms() {
        return Object.keys(rooms)
    },
    getRoom(roomId) {
        if (rooms[roomId]) {
            return rooms[roomId]
        }
        console.error('No room by id', roomId)
    },
    getOwnRooms(cookies) {
        const adminIds = Object.values(cookies)

        return Object.keys(rooms).filter((roomId) => adminIds.find((adminId) => adminId === rooms[roomId].adminId))
    },
    createRoom(adminId) {
        const roomId = uuidv4()

        rooms[roomId] = {
            adminId,
            users: {},
            elements: [],
        }

        return roomId
    },
    createAdmin() {
        return uuidv4()
    },
    createUser() {
        return uuidv4()
    },
}
