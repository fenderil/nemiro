module.exports = (room, userId, cursor) => {
    if (!room.users[userId]) {
        room.users[userId] = {}
    }

    room.users[userId].cursor = cursor
}
