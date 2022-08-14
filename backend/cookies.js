module.exports = {
    setAdminCookie (res, roomId, adminId) {
        res.cookie(roomId, adminId, { httpOnly: true })
    },
    setIsAdminCookie (res, roomId) {
        res.cookie(`${roomId}:admin`, true)
    },
    setUserCookie (res, roomId, userId) {
        res.cookie(roomId, userId, { httpOnly: true })
    }
}