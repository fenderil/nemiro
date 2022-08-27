module.exports = (room) => {
  if (!room.timer) {
    room.timer = {}
  }
  room.timer.id = (room.timer.id || 0) + 1
  room.timer.from = Number(new Date())
  room.timer.duration = 60 * 5
  room.timer.action = 'start'
}
