module.exports = (room) => {
  if (!room.timer) {
    room.timer = {}
  }
  room.timer.action = 'stop'
}
