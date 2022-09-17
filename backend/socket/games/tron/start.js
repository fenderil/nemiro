const {
    getRandomInCollection,
    getRandomNumber,
    getOnlinePlayers,
    GAME_STATUSES,
    sendAll,
} = require('../utils')
const {
    TRON_HEIGHT,
    TRON_WIDTH,
    COLORS,
} = require('./constants')

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

exports.start = (room) => {
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
        status: GAME_STATUSES.start,
        width: TRON_WIDTH,
        height: TRON_HEIGHT,
    }

    sendAll(room)
}
