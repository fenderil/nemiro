module.exports = (room, userId, id) => {
  const expectedElement = room.elements.find((element) => element.id === id)

  if (expectedElement) {
    if (userId === room.adminId || userId === expectedElement.authorId) {
      room.elements = room.elements.filter((element) => element.id !== id)
    }
  }
}
