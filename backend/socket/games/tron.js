const { sendAllUpdate } = require('../update')

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
const SPEED_PER_TICK_RATES = [2, 3, 4, 5]
const NITRO_RATES = [2, 3]
// TODO: recalc for every next game
const SPEED_PER_TICK = SPEED_PER_TICK_RATES[Math.floor(Math.random() * SPEED_PER_TICK_RATES.length)]
const NITRO = NITRO_RATES[Math.floor(Math.random() * NITRO_RATES.length)]

const getRandomPosition = () => [
    Math.floor(Math.random() * Math.floor(TRON_WIDTH / SPEED_PER_TICK)) * SPEED_PER_TICK,
    Math.floor(Math.random() * Math.floor(TRON_HEIGHT / SPEED_PER_TICK)) * SPEED_PER_TICK,
]

const getStartDirectionPosition = (startPosition) => {
    const directions = [
        startPosition[0],
        startPosition[1],
        TRON_WIDTH - startPosition[0],
        TRON_HEIGHT - startPosition[1],
    ]

    const minDirection = Math.min(...directions)

    switch (minDirection) {
    case directions[0]: {
        return [startPosition[0] + SPEED_PER_TICK, startPosition[1]]
    }
    case directions[1]: {
        return [startPosition[0], startPosition[1] + SPEED_PER_TICK]
    }
    case directions[2]: {
        return [startPosition[0] - SPEED_PER_TICK, startPosition[1]]
    }
    case directions[3]: {
        return [startPosition[0], startPosition[1] - SPEED_PER_TICK]
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
    const playerPoint = player.points[player.points.length - 1]
    const intersected = players.find((subPlayer) => subPlayer.points.find(
        (prevPoint, i, collection) => {
            const nextPoint = collection[i + 1]
            if (nextPoint) {
                if (subPlayer === player && (playerPoint === nextPoint || playerPoint === prevPoint)) {
                    return false
                }
                return isIn(playerPoint, prevPoint, nextPoint)
            }
            return false
        },
    ))

    return Boolean(intersected)
}

const startTronGame = (room) => {
    room.games.tron = {
        players: Object.values(room.users)
            .filter(({ online }) => online)
            .map(({ name }, index) => {
                const startPosition = getRandomPosition()
                const nextPosition = getStartDirectionPosition(startPosition)

                return {
                    name,
                    color: COLORS[index],
                    dead: false,
                    points: [startPosition, nextPosition],
                }
            }),
        action: 'start',
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
        room.games.tron.action = 'stop'
        clearInterval(room.gamesPrivate.tron.intervalId)
    }
}

const firstTick = (room) => {
    room.gamesPrivate.tron.intervalId = setInterval(() => {
        room.games.tron.players.forEach((player) => {
            if (!player.dead) {
                const lastPointIndex = player.points.length - 1
                const lastPoints = getTwoLastPoints(player)
                const direction = getDirection(lastPoints)

                if (direction === DIRECTIONS.right) {
                    player.points[lastPointIndex][0] = lastPoints[0][0] + SPEED_PER_TICK
                } else if (direction === DIRECTIONS.left) {
                    player.points[lastPointIndex][0] = lastPoints[0][0] - SPEED_PER_TICK
                } else if (direction === DIRECTIONS.down) {
                    player.points[lastPointIndex][1] = lastPoints[0][1] + SPEED_PER_TICK
                } else if (direction === DIRECTIONS.up) {
                    player.points[lastPointIndex][1] = lastPoints[0][1] - SPEED_PER_TICK
                }

                if (player.points[lastPointIndex][0] < 0
                    || player.points[lastPointIndex][1] < 0
                    || player.points[lastPointIndex][0] > TRON_WIDTH
                    || player.points[lastPointIndex][1] > TRON_HEIGHT
                    || isIntersection(player, room.games.tron.players)) {
                    player.dead = true
                }
            }
        })

        checkEndGame(room)

        sendAllUpdate(room, ['games'])
    }, TICK_TIME)
}

const restTick = (room, userId, msg) => {
    room.games.tron.action = 'edit'
    const userName = room.users[userId].name
    const player = room.games.tron.players.find(({ name }) => userName === name)

    const lastPointIndex = player.points.length - 1
    const lastPoints = getTwoLastPoints(player)
    const direction = getDirection(lastPoints)

    switch (msg.direction) {
    case DIRECTIONS.up: {
        if (direction !== DIRECTIONS.down) {
            if (direction === DIRECTIONS.up) {
                player.points[lastPointIndex][1] = lastPoints[0][1] - NITRO * SPEED_PER_TICK
            } else {
                player.points.push([lastPoints[0][0], lastPoints[0][1] - SPEED_PER_TICK])
            }
        }
        break
    }
    case DIRECTIONS.left: {
        if (direction !== DIRECTIONS.right) {
            if (direction === DIRECTIONS.left) {
                player.points[lastPointIndex][0] = lastPoints[0][0] - NITRO * SPEED_PER_TICK
            } else {
                player.points.push([lastPoints[0][0] - SPEED_PER_TICK, lastPoints[0][1]])
            }
        }
        break
    }
    case DIRECTIONS.down: {
        if (direction !== DIRECTIONS.up) {
            if (direction === DIRECTIONS.down) {
                player.points[lastPointIndex][1] = lastPoints[0][1] + NITRO * SPEED_PER_TICK
            } else {
                player.points.push([lastPoints[0][0], lastPoints[0][1] + SPEED_PER_TICK])
            }
        }
        break
    }
    case DIRECTIONS.right: {
        if (direction !== DIRECTIONS.left) {
            if (direction === DIRECTIONS.right) {
                player.points[lastPointIndex][0] = lastPoints[0][0] + NITRO * SPEED_PER_TICK
            } else {
                player.points.push([lastPoints[0][0] + SPEED_PER_TICK, lastPoints[0][1]])
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
    if (room.games.tron) {
        if (room.games.tron.action === 'start') {
            firstTick(room)
        }

        if (room.games.tron.action !== 'stop') {
            restTick(room, userId, msg)
        }
    }
}

module.exports = (room, msg, userId) => {
    if (msg.action === 'start' && userId === room.adminId) {
        startTronGame(room, msg)
    } else if (msg.action === 'edit') {
        editTronGame(room, userId, msg)
    } else if (msg.action === 'stop') {
        delete room.games.tron
    }
}
