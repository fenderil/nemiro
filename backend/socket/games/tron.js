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

const TICK_TIME = 50
const SPEED_PER_TICK_RATES = [2, 3, 4, 5]
const NITRO_RATES = [1, 2, 3]
const SPEED_PER_TICK = SPEED_PER_TICK_RATES[Math.floor(Math.random() * SPEED_PER_TICK_RATES.length)]
const NITRO = NITRO_RATES[Math.floor(Math.random() * NITRO_RATES.length)]

const getRandomPosition = () => [
    Math.floor(Math.random() * Math.floor(TRON_WIDTH / SPEED_PER_TICK)) * SPEED_PER_TICK,
    Math.floor(Math.random() * Math.floor(TRON_HEIGHT / SPEED_PER_TICK)) * SPEED_PER_TICK,
]

const getDirectionPosition = (startPosition) => {
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
                const nextPosition = getDirectionPosition(startPosition)

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
}

// TODO: refactor for not sending context intervalId
let intervalId = null

const editTronGame = (room, userId, msg) => {
    if (room.games.tron) {
        if (room.games.tron.action === 'start') {
            intervalId = setInterval(() => {
                room.games.tron.players.forEach((player) => {
                    if (!player.dead) {
                        const lastPointIndex = player.points.length - 1
                        const [lastPointX, lastPointY] = player.points[lastPointIndex]
                        const [preLastPointX, preLastPointY] = player.points[lastPointIndex - 1]

                        if (lastPointX > preLastPointX) {
                            player.points[lastPointIndex][0] = lastPointX + SPEED_PER_TICK
                        } else if (lastPointX < preLastPointX) {
                            player.points[lastPointIndex][0] = lastPointX - SPEED_PER_TICK
                        } else if (lastPointY > preLastPointY) {
                            player.points[lastPointIndex][1] = lastPointY + SPEED_PER_TICK
                        } else if (lastPointY < preLastPointY) {
                            player.points[lastPointIndex][1] = lastPointY - SPEED_PER_TICK
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

                if (room.games.tron.players.every(({ dead }) => dead)) {
                    room.games.tron.action = 'stop'
                    clearInterval(intervalId)
                }

                sendAllUpdate(room, ['games'])
            }, TICK_TIME)
        }
        room.games.tron.action = 'edit'
        const userName = room.users[userId].name
        const player = room.games.tron.players.find(({ name }) => userName === name)

        const lastPointIndex = player.points.length - 1
        const [lastPointX, lastPointY] = player.points[lastPointIndex]
        const [preLastPointX, preLastPointY] = player.points[lastPointIndex - 1]

        let direction

        if (lastPointX > preLastPointX) {
            direction = 'right'
        } else if (lastPointX < preLastPointX) {
            direction = 'left'
        } else if (lastPointY > preLastPointY) {
            direction = 'down'
        } else if (lastPointY < preLastPointY) {
            direction = 'up'
        }

        switch (msg.direction) {
        case 'up': {
            if (direction !== 'down') {
                if (direction === 'up') {
                    player.points[lastPointIndex][1] = lastPointY - NITRO * SPEED_PER_TICK
                } else {
                    player.points.push([lastPointX, lastPointY - SPEED_PER_TICK])
                }
            }
            break
        }
        case 'left': {
            if (direction !== 'right') {
                if (direction === 'left') {
                    player.points[lastPointIndex][0] = lastPointX - NITRO * SPEED_PER_TICK
                } else {
                    player.points.push([lastPointX - SPEED_PER_TICK, lastPointY])
                }
            }
            break
        }
        case 'down': {
            if (direction !== 'up') {
                if (direction === 'down') {
                    player.points[lastPointIndex][1] = lastPointY + NITRO * SPEED_PER_TICK
                } else {
                    player.points.push([lastPointX, lastPointY + SPEED_PER_TICK])
                }
            }
            break
        }
        case 'right': {
            if (direction !== 'left') {
                if (direction === 'right') {
                    player.points[lastPointIndex][0] = lastPointX + NITRO * SPEED_PER_TICK
                } else {
                    player.points.push([lastPointX + SPEED_PER_TICK, lastPointY])
                }
            }
            break
        }
        default: {
            throw new Error('Impossible!')
        }
        }

        const minAlivePlayers = room.games.tron.players.length > 1 ? 1 : 0
        if (room.games.tron.players.filter(({ dead }) => !dead).length <= minAlivePlayers) {
            room.games.tron.action = 'stop'
            clearInterval(intervalId)
        }

        sendAllUpdate(room, ['games'])
    }
}

module.exports = (room, msg, userId) => {
    if (msg.action === 'start' && userId === room.adminId) {
        startTronGame(room, msg)
        sendAllUpdate(room, ['games'])
    } else if (msg.action === 'edit') {
        editTronGame(room, userId, msg)
        sendAllUpdate(room, ['games'])
    } else if (msg.action === 'stop') {
        delete room.games.tron
    }
}
