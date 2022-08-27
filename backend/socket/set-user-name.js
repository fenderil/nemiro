module.exports = (room, userId, name) => {
  if (!room.users[userId]) {
    room.users[userId] = {}
  }

  room.users[userId].name = name
  room.users[userId].online = true
  room.users[userId].admin = userId === room.adminId
}
