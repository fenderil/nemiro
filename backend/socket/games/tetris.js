const { sendAllUpdate } = require('../update')
const {
    getRandomInCollection,
    getRandomNumber,
    getOnlinePlayers,
    GAME_STATUSES,
    COMMAND_STATUSES,
} = require('./utils')

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

const CLASSIC_FIGURES = [
    [[0, 5], [0, 4], [0, 6], [0, 7]],
    [[0, 5], [0, 4], [0, 6], [-1, 5]],
    [[0, 5], [0, 4], [-1, 6], [-1, 5]],
    [[0, 5], [-1, 4], [0, 6], [-1, 5]],
    [[0, 5], [-1, 5], [0, 6], [-1, 6]],
    [[0, 5], [0, 4], [-1, 4], [0, 6]],
    [[0, 5], [0, 6], [-1, 6], [0, 4]],
]
const EXTRA_FIGURES = [
    [[0, 5], [1, 6]],
    [[0, 5], [0, 6]],
    [[0, 5], [0, 4], [0, 6]],
    [[0, 5], [1, 5], [0, 6]],
    [[0, 5], [0, 4], [1, 4], [0, 6], [1, 6]],
    [[0, 5], [0, 4], [1, 4], [1, 5], [1, 6]],
    [[0, 5], [0, 4], [1, 4], [0, 6], [1, 5]],
]

const TICK_TIME = 300

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

    const figures = getRandomNumber(3) > 0
        ? [...CLASSIC_FIGURES]
        : [...CLASSIC_FIGURES, ...EXTRA_FIGURES]

    room.games.tetris = {
        players: getOnlinePlayers(room)
            .map(({ name }, index) => ({
                name,
                color: COLORS[index],
                score: 0,
            })),
        action: GAME_STATUSES.start,
        width: TETRIS_WIDTH,
        height: TETRIS_HEIGHT,
        activePlayerIndex: 0,
        activePoints: getRandomInCollection(figures),
        field: createField(),
        figures,
    }

    sendAllUpdate(room, ['games'])
}

const checkEndGame = (room) => {
    if (room.games.tetris.field[0].some((color) => color)) {
        room.games.tetris.action = GAME_STATUSES.stop
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
    tetris.action = GAME_STATUSES.run
    if (!tetris.activePoints.length) {
        let rotations = getRandomNumber(4)
        let nextFigure = getRandomInCollection(tetris.figures)
        while (rotations > 0) {
            nextFigure = unsafeRotate(nextFigure)
            rotations -= 1
        }
        tetris.activePoints = nextFigure
    }

    const prevPosition = tetris.activePoints

    goDown(room)

    if (prevPosition === tetris.activePoints) {
        tetris.activePoints.forEach(([y, x]) => {
            if (y < 0) {
                room.games.tetris.action = GAME_STATUSES.stop
                clearInterval(room.gamesPrivate.tetris.intervalId)
            } else {
                tetris.field[y][x] = tetris.players[tetris.activePlayerIndex].color
            }
        })
        tetris.activePoints = []
    }

    const restField = tetris.field.filter((row) => !row.every((cell) => cell))
    const closedRows = TETRIS_HEIGHT - restField.length

    if (closedRows) {
        tetris.field = [...createField(closedRows), ...restField]
        const additionalPoints = closedRows === 4 ? 8 : closedRows
        tetris.players[tetris.activePlayerIndex].score += additionalPoints
    }

    if (closedRows === 0 && !tetris.activePoints.length) {
        tetris.activePlayerIndex = (tetris.activePlayerIndex + 1) % tetris.players.length
    }

    checkEndGame(room)

    sendAllUpdate(room, ['games'])
}

const firstAction = (room) => {
    room.gamesPrivate.tetris.intervalId = setInterval(tick, TICK_TIME, room)
}

const restAction = (room, userId, msg) => {
    const { tetris } = room.games
    const userName = room.users[userId].name

    if (tetris.players[tetris.activePlayerIndex].name === userName && tetris.activePoints.length) {
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
        if (room.games.tetris.action === GAME_STATUSES.start) {
            firstAction(room)
        }

        if (room.games.tetris.action !== GAME_STATUSES.stop) {
            restAction(room, userId, msg)
        }
    }
}

module.exports = (room, msg, userId) => {
    if (msg.action === COMMAND_STATUSES.start && userId === room.adminId) {
        startTetrisGame(room, msg)
    } else if (msg.action === COMMAND_STATUSES.edit) {
        editTetrisGame(room, userId, msg)
    } else if (msg.action === COMMAND_STATUSES.stop) {
        clearInterval(room.gamesPrivate.tetris.intervalId)
        delete room.games.tetris
    }
}
