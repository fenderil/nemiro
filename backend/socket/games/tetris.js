const { sendAllUpdate } = require('../update')
const { getRandomInCollection } = require('./utils')

const TETRIS_WIDTH = 11
const TETRIS_HEIGHT = 20

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

const FIGURES = [
    [[0, 5], [0, 4], [0, 6], [0, 7]],
    [[0, 5], [0, 4], [0, 6], [-1, 5]],
    [[0, 5], [0, 4], [-1, 6], [-1, 5]],
    [[0, 5], [-1, 4], [0, 6], [-1, 5]],
    [[0, 5], [-1, 5], [0, 6], [-1, 6]],
    [[0, 5], [0, 4], [-1, 4], [0, 6]],
    [[0, 5], [0, 6], [-1, 6], [0, 4]],
]

const TICK_TIME = 200

const createField = (height = TETRIS_HEIGHT, width = TETRIS_WIDTH) => {
    const field = []

    for (let i = 0; i < height; i += 1) {
        field[i] = []
        for (let j = 0; j < width; j += 1) {
            field[i][j] = null
        }
    }

    return field
}

const unsafeRotate = (activePoints) => {
    const [first, ...rest] = activePoints
    return [first, ...rest.map(([y, x]) => [first[0] - x + first[1], first[1] + y - first[0]])]
}

const isIntersection = (field, figure) => figure.some(([i, j]) => field[i] && field[i][j])
const isIn = (figure) => figure.every(([i, j]) => i < TETRIS_HEIGHT && j >= 0 && j < TETRIS_WIDTH)

const startTetrisGame = (room) => {
    if (room.games.tetris && room.gamesPrivate.tetris.intervalId) {
        clearInterval(room.gamesPrivate.tetris.intervalId)
    }

    room.games.tetris = {
        players: Object.values(room.users)
            .filter(({ online }) => online)
            .map(({ name }, index) => ({
                name,
                color: COLORS[index],
            })),
        action: 'start',
        width: TETRIS_WIDTH,
        height: TETRIS_HEIGHT,
        activePlayerIndex: 0,
        activePoints: getRandomInCollection(FIGURES),
        field: createField(),
    }

    sendAllUpdate(room, ['games'])
}

const checkEndGame = (room) => {
    if (room.games.tetris.field[0].some((color) => color)) {
        room.games.tetris.action = 'stop'
        clearInterval(room.gamesPrivate.tetris.intervalId)
    }
}

const goLeft = (room) => {
    const nextPosition = room.games.tetris.activePoints
        .map(([y, x]) => [y, x - 1])

    if (isIn(nextPosition) && !isIntersection(room.games.tetris.field, nextPosition)) {
        room.games.tetris.activePoints = nextPosition
    }
}

const goRight = (room) => {
    const nextPosition = room.games.tetris.activePoints
        .map(([y, x]) => [y, x + 1])

    if (isIn(nextPosition) && !isIntersection(room.games.tetris.field, nextPosition)) {
        room.games.tetris.activePoints = nextPosition
    }
}

const goDown = (room) => {
    const nextPosition = room.games.tetris.activePoints
        .map(([y, x]) => [y + 1, x])

    if (isIn(nextPosition) && !isIntersection(room.games.tetris.field, nextPosition)) {
        room.games.tetris.activePoints = nextPosition
    }
}

const rotate = (room) => {
    const nextPosition = unsafeRotate(room.games.tetris.activePoints)

    if (isIn(nextPosition) && !isIntersection(room.games.tetris.field, nextPosition)) {
        room.games.tetris.activePoints = nextPosition
    }
}

const tick = (room) => {
    const { tetris } = room.games
    if (!tetris.activePoints.length) {
        // TODO: start with random count of rotation (0..3)
        tetris.activePoints = getRandomInCollection(FIGURES)
    }

    const prevPosition = tetris.activePoints

    goDown(room)

    if (prevPosition === tetris.activePoints) {
        tetris.activePoints.forEach(([y, x]) => {
            if (y < 0) {
                room.games.tetris.action = 'stop'
                clearInterval(room.gamesPrivate.tetris.intervalId)
            } else {
                tetris.field[y][x] = tetris.players[tetris.activePlayerIndex].color
            }
        })
        tetris.activePoints = []
    }

    const restField = tetris.field.filter((row) => !row.every((cell) => cell))

    tetris.field = [...createField(TETRIS_HEIGHT - restField.length), ...restField]

    if (restField.length === TETRIS_HEIGHT && !tetris.activePoints.length) {
        tetris.activePlayerIndex = (tetris.activePlayerIndex + 1) % tetris.players.length
    }

    checkEndGame(room)

    sendAllUpdate(room, ['games'])
}

const firstTick = (room) => {
    room.gamesPrivate.tetris.intervalId = setInterval(tick, TICK_TIME, room)
}

const restTick = (room, userId, msg) => {
    room.games.tetris.action = 'edit'
    const userName = room.users[userId].name

    if (room.games.tetris.players[room.games.tetris.activePlayerIndex].name === userName) {
        switch (msg.direction) {
        case DIRECTIONS.up: {
            rotate(room)
            break
        }
        case DIRECTIONS.left: {
            goLeft(room)
            break
        }
        case DIRECTIONS.down: {
            goDown(room)
            break
        }
        case DIRECTIONS.right: {
            goRight(room)
            break
        }
        default: {
            throw new Error('Impossible!')
        }
        }

        sendAllUpdate(room, ['games'])
    }
}

const editTetrisGame = (room, userId, msg) => {
    if (room.games.tetris) {
        if (room.games.tetris.action === 'start') {
            firstTick(room)
        }

        if (room.games.tetris.action !== 'stop') {
            restTick(room, userId, msg)
        }
    }
}

module.exports = (room, msg, userId) => {
    if (msg.action === 'start' && userId === room.adminId) {
        startTetrisGame(room, msg)
    } else if (msg.action === 'edit') {
        editTetrisGame(room, userId, msg)
    } else if (msg.action === 'stop') {
        clearInterval(room.gamesPrivate.tetris.intervalId)
        delete room.games.tetris
    }
}
