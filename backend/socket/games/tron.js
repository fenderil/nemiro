const { sendAllUpdate } = require('../update')
const {
    getRandomInCollection,
    getRandomNumber,
    getOnlinePlayers,
    GAME_STATUSES,
    COMMAND_STATUSES,
} = require('./utils')

const TRON_WIDTH = 360
const TRON_HEIGHT = 360

const COLORS = [
    '#e6194b',
    '#3cb44b',
    '#ffe119',
    '#0082c8',
    '#f58230',
    '#911eb4',
    '#f032e6',
    '#d2f53c',
    '#fabebe',
    '#e6beff',
    '#aa6e28',
    '#fffac8',
    '#800000',
    '#aaffc3',
    '#808000',
    '#ffd7b4',
    '#000080',
    '#808080',
    '#000000',
]

const DIRECTIONS = {
    up: 'up',
    left: 'left',
    down: 'down',
    right: 'right',
}

const TICK_TIME = 25

const getPerTickSpeed = (count) => {
    if (count > 5) {
        return getRandomInCollection([1, 2])
    }
    if (count > 3) {
        return getRandomInCollection([2, 3])
    }
    return getRandomInCollection([2, 3, 4])
}
const getNitro = (count) => {
    if (count > 3) {
        return getRandomInCollection([2, 3])
    }
    return getRandomInCollection([2, 3, 4])
}

const getRandomPosition = (perTickSpeed) => [
    getRandomNumber(TRON_WIDTH / perTickSpeed) * perTickSpeed,
    getRandomNumber(TRON_HEIGHT / perTickSpeed) * perTickSpeed,
]

const getStartDirectionPosition = (startPosition, perTickSpeed) => {
    const directions = [
        startPosition[0],
        startPosition[1],
        TRON_WIDTH - startPosition[0],
        TRON_HEIGHT - startPosition[1],
    ]

    const minDirection = Math.min(...directions)

    switch (minDirection) {
    case directions[0]: {
        return [startPosition[0] + perTickSpeed, startPosition[1]]
    }
    case directions[1]: {
        return [startPosition[0], startPosition[1] + perTickSpeed]
    }
    case directions[2]: {
        return [startPosition[0] - perTickSpeed, startPosition[1]]
    }
    case directions[3]: {
        return [startPosition[0], startPosition[1] - perTickSpeed]
    }
    default: {
        throw new Error('Impossible!')
    }
    }
}

const isIn = (x, a, b) => {
    if (x[0] === a[0] && x[0] === b[0]) {
        return x[1] >= Math.min(a[1], b[1]) && x[1] <= Math.max(a[1], b[1])
    }
    if (x[1] === a[1] && x[1] === b[1]) {
        return x[0] >= Math.min(a[0], b[0]) && x[0] <= Math.max(a[0], b[0])
    }
    return false
}

const isIntersection = (player, players) => {
    const playerPosition = player.points[player.points.length - 1]
    const intersected = players.find((killerPlayer) => killerPlayer.points.find(
        (prevPosition, i, collection) => {
            const nextPosition = collection[i + 1]
            if (nextPosition) {
                if (killerPlayer === player && (playerPosition === nextPosition || playerPosition === prevPosition)) {
                    return false
                }
                return isIn(playerPosition, prevPosition, nextPosition)
            }
            return false
        },
    ))

    return Boolean(intersected)
}

const startTronGame = (room) => {
    const onlinePlayers = getOnlinePlayers(room)

    const perTickSpeed = getPerTickSpeed(onlinePlayers.length)
    const nitroSpeed = getNitro(onlinePlayers.length) * perTickSpeed

    if (room.games.tron && room.gamesPrivate.tron.intervalId) {
        clearInterval(room.gamesPrivate.tron.intervalId)
    }

    const players = onlinePlayers
        .map(({ name }, index) => {
            const startPosition = getRandomPosition(perTickSpeed)
            const nextPosition = getStartDirectionPosition(startPosition, perTickSpeed)

            return {
                name,
                color: COLORS[index],
                dead: false,
                points: [startPosition, nextPosition],
            }
        })

    room.games.tron = {
        perTickSpeed,
        nitroSpeed,
        players,
        action: GAME_STATUSES.start,
        width: TRON_WIDTH,
        height: TRON_HEIGHT,
    }

    sendAllUpdate(room, ['games'])
}

const getTwoLastPoints = (player) => {
    const lastPointIndex = player.points.length - 1
    return [
        player.points[lastPointIndex],
        player.points[lastPointIndex - 1],
    ]
}

const getDirection = (points) => {
    if (points[0][0] > points[1][0]) {
        return DIRECTIONS.right
    }
    if (points[0][0] < points[1][0]) {
        return DIRECTIONS.left
    }
    if (points[0][1] > points[1][1]) {
        return DIRECTIONS.down
    }
    if (points[0][1] < points[1][1]) {
        return DIRECTIONS.up
    }

    return DIRECTIONS.up
}

const checkEndGame = (room) => {
    const minAlivePlayers = room.games.tron.players.length > 1 ? 1 : 0
    if (room.games.tron.players.filter(({ dead }) => !dead).length <= minAlivePlayers) {
        room.games.tron.action = GAME_STATUSES.stop
        clearInterval(room.gamesPrivate.tron.intervalId)
    }
}

const tick = (room) => {
    const { perTickSpeed, players } = room.games.tron

    players.forEach((player) => {
        if (!player.dead) {
            const lastPointIndex = player.points.length - 1
            const lastPoints = getTwoLastPoints(player)
            const direction = getDirection(lastPoints)

            if (direction === DIRECTIONS.right) {
                player.points[lastPointIndex][0] = lastPoints[0][0] + perTickSpeed
            } else if (direction === DIRECTIONS.left) {
                player.points[lastPointIndex][0] = lastPoints[0][0] - perTickSpeed
            } else if (direction === DIRECTIONS.down) {
                player.points[lastPointIndex][1] = lastPoints[0][1] + perTickSpeed
            } else if (direction === DIRECTIONS.up) {
                player.points[lastPointIndex][1] = lastPoints[0][1] - perTickSpeed
            }

            if (player.points[lastPointIndex][0] < 0
                || player.points[lastPointIndex][1] < 0
                || player.points[lastPointIndex][0] > TRON_WIDTH
                || player.points[lastPointIndex][1] > TRON_HEIGHT
                || isIntersection(player, players)) {
                player.dead = true
            }
        }
    })

    checkEndGame(room)

    sendAllUpdate(room, ['games'])
}

const firstAction = (room) => {
    room.games.tron.action = GAME_STATUSES.steady
    sendAllUpdate(room, ['games'])
    setTimeout(() => {
        room.games.tron.action = GAME_STATUSES.run
        if (room.gamesPrivate.tron) {
            room.gamesPrivate.tron.intervalId = setInterval(tick, TICK_TIME, room)
        }
    }, 3100)
}

const restAction = (room, userId, msg) => {
    const userName = room.users[userId].name
    const player = room.games.tron.players.find(({ name }) => userName === name)

    const lastPointIndex = player.points.length - 1
    const lastPoints = getTwoLastPoints(player)
    const direction = getDirection(lastPoints)

    switch (msg.direction) {
    case DIRECTIONS.up: {
        if (direction !== DIRECTIONS.down) {
            if (direction === DIRECTIONS.up) {
                player.points[lastPointIndex][1] = lastPoints[0][1] - room.games.tron.nitroSpeed
            } else {
                player.points.push([
                    lastPoints[0][0],
                    lastPoints[0][1] - room.games.tron.perTickSpeed,
                ])
            }
        }
        break
    }
    case DIRECTIONS.left: {
        if (direction !== DIRECTIONS.right) {
            if (direction === DIRECTIONS.left) {
                player.points[lastPointIndex][0] = lastPoints[0][0] - room.games.tron.nitroSpeed
            } else {
                player.points.push([
                    lastPoints[0][0] - room.games.tron.perTickSpeed,
                    lastPoints[0][1],
                ])
            }
        }
        break
    }
    case DIRECTIONS.down: {
        if (direction !== DIRECTIONS.up) {
            if (direction === DIRECTIONS.down) {
                player.points[lastPointIndex][1] = lastPoints[0][1] + room.games.tron.nitroSpeed
            } else {
                player.points.push([
                    lastPoints[0][0],
                    lastPoints[0][1] + room.games.tron.perTickSpeed,
                ])
            }
        }
        break
    }
    case DIRECTIONS.right: {
        if (direction !== DIRECTIONS.left) {
            if (direction === DIRECTIONS.right) {
                player.points[lastPointIndex][0] = lastPoints[0][0] + room.games.tron.nitroSpeed
            } else {
                player.points.push([
                    lastPoints[0][0] + room.games.tron.perTickSpeed,
                    lastPoints[0][1],
                ])
            }
        }
        break
    }
    default: {
        throw new Error('Impossible!')
    }
    }

    checkEndGame(room)
}

const editTronGame = (room, userId, msg) => {
    if (room.games.tron && room.games.tron.action !== GAME_STATUSES.steady) {
        if (room.games.tron.action === GAME_STATUSES.start) {
            firstAction(room)
        }

        if (room.games.tron.action !== GAME_STATUSES.stop) {
            restAction(room, userId, msg)
        }
    }
}

module.exports = (room, msg, userId) => {
    if (msg.action === COMMAND_STATUSES.start && userId === room.adminId) {
        startTronGame(room, msg)
    } else if (msg.action === COMMAND_STATUSES.edit) {
        editTronGame(room, userId, msg)
    } else if (msg.action === COMMAND_STATUSES.stop) {
        clearInterval(room.gamesPrivate.tron.intervalId)
        delete room.games.tron
    }
}
