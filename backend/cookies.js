const afterOneDay = () => new Date(Date.now() + 24 * 60 * 60 * 1000)

module.exports = {
    setAdminCookie(res, roomId, adminId) {
        res.cookie(roomId, adminId, { httpOnly: true, expires: afterOneDay() })
    },
    setIsAdminCookie(res, roomId) {
        res.cookie(`${roomId}:admin`, true, { expires: afterOneDay() })
    },
    setUserCookie(res, roomId, userId) {
        res.cookie(roomId, userId, { httpOnly: true, expires: afterOneDay() })
    },
}
