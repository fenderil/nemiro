const { GAME_STATUSES, sendAll } = require('../utils')
const {
    TRON_HEIGHT,
    TRON_WIDTH,
    DIRECTIONS,
    REVERT_DIRECTIONS,
    TICK_TIME,
} = require('./constants')

const isIntersected = (x, a, b) => {
    if (x[0] === a[0] && x[0] === b[0]) {
        return x[1] >= Math.min(a[1], b[1]) && x[1] <= Math.max(a[1], b[1])
    }
    if (x[1] === a[1] && x[1] === b[1]) {
        return x[0] >= Math.min(a[0], b[0]) && x[0] <= Math.max(a[0], b[0])
    }
    return false
}

const isOutboundary = (point, width = TRON_WIDTH, height = TRON_HEIGHT) => point[0] < 0
    || point[1] < 0 || point[0] > width || point[1] > height

const isKilled = (player, players) => {
    const [playerPosition] = player.points.slice(-1)
    const intersected = players.find((killerPlayer) => killerPlayer.points.find(
        (prevPosition, i, collection) => {
            const nextPosition = collection[i + 1]
            if (nextPosition) {
                if (playerPosition === nextPosition) {
                    return false
                }
                return isIntersected(playerPosition, prevPosition, nextPosition)
            }
            return false
        },
    ))

    return Boolean(intersected)
}

const getDirection = (point1, point2) => {
    if (point1[0] > point2[0]) {
        return DIRECTIONS.right
    }
    if (point1[0] < point2[0]) {
        return DIRECTIONS.left
    }
    if (point1[1] > point2[1]) {
        return DIRECTIONS.down
    }
    if (point1[1] < point2[1]) {
        return DIRECTIONS.up
    }

    return DIRECTIONS.up
}

const checkEndGame = (room) => {
    const minAlivePlayers = room.games.tron.players.length > 1 ? 1 : 0
    if (room.games.tron.players.filter(({ dead }) => !dead).length <= minAlivePlayers) {
        room.games.tron.status = GAME_STATUSES.stop
        clearInterval(room.gamesPrivate.tron.intervalId)
    }
}

const xor = (condition, result) => {
    if (condition) {
        return result
    }
    return 0
}

const move = (points, perTickSpeed, direction, nitroSpeed = perTickSpeed) => {
    const [preLast, last] = points.slice(-2)
    const movingDirection = getDirection(last, preLast)

    if (!direction) {
        direction = movingDirection
    }

    if (direction !== REVERT_DIRECTIONS[movingDirection]) {
        const sameDirection = direction === movingDirection
        const delta = sameDirection ? nitroSpeed : perTickSpeed

        const xDiff = xor(direction === DIRECTIONS.left, -delta)
            || xor(direction === DIRECTIONS.right, delta)
        const yDiff = xor(direction === DIRECTIONS.up, -delta)
            || xor(direction === DIRECTIONS.down, delta)

        points[points.length - Number(sameDirection)] = [
            last[0] + xDiff,
            last[1] + yDiff,
        ]
    }
}

const tick = (room) => {
    const { perTickSpeed, players } = room.games.tron

    players.forEach((player) => {
        if (!player.dead) {
            move(player.points, perTickSpeed)

            if (isOutboundary(player.points.slice(-1)[0]) || isKilled(player, players)) {
                player.dead = true
            }
        }
    })

    checkEndGame(room)

    sendAll(room)
}

const firstAction = (room) => {
    room.games.tron.status = GAME_STATUSES.steady
    sendAll(room)

    setTimeout(() => {
        room.games.tron.status = GAME_STATUSES.run
        if (room.gamesPrivate.tron) {
            room.gamesPrivate.tron.intervalId = setInterval(tick, TICK_TIME, room)
        }
    }, 3100)
}

const restAction = (room, userId, msg) => {
    const userName = room.users[userId].name
    const player = room.games.tron.players.find(({ name }) => userName === name)

    move(player.points, room.games.tron.perTickSpeed, msg.direction, room.games.tron.nitroSpeed)

    checkEndGame(room)
}

exports.effect = (room, userId, msg) => {
    if (room.games.tron && room.games.tron.status !== GAME_STATUSES.steady) {
        if (room.games.tron.status === GAME_STATUSES.start) {
            firstAction(room)
        }

        if (room.games.tron.status !== GAME_STATUSES.stop) {
            restAction(room, userId, msg)
        }
    }
}
