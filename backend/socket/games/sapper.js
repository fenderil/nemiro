const { sendAllUpdate } = require('../update')

const SAPPER_WIDTH = 16
const SAPPER_HEIGHT = 16
const SAPPER_RATES = [1 / 8, 1 / 6, 1 / 4]
const STATUSES = {
    unknown: 'unknown',
    flagged: 'flagged',
    opened: 'opened',
    closed: 'closed',
    bomb: 'bomb',
    dead: 'dead',
}

const createPrivateField = ([x, y]) => {
    const field = []
    let bombs = 0
    const rate = SAPPER_RATES[Math.floor(Math.random() * SAPPER_RATES.length)]

    for (let i = 0; i < SAPPER_WIDTH; i += 1) {
        if (!field[i]) {
            field[i] = []
        }

        for (let j = 0; j < SAPPER_HEIGHT; j += 1) {
            // TODO: no random please
            if (x === i && y === j) {
                field[i][j] = field[i][j] || 0
            } else if (Math.random() <= rate) {
                field[i][j] = STATUSES.bomb
                bombs += 1

                for (let di = -1; di <= 1; di += 1) {
                    for (let dj = -1; dj <= 1; dj += 1) {
                        if (i + di >= 0
                            && i + di < SAPPER_WIDTH
                            && j + dj >= 0
                            && j + dj < SAPPER_HEIGHT) {
                            if (!field[i + di]) {
                                field[i + di] = []
                            }

                            if (!field[i + di][j + dj]) {
                                field[i + di][j + dj] = 0
                            }

                            if (field[i + di][j + dj] !== STATUSES.bomb) {
                                field[i + di][j + dj] += 1
                            }
                        }
                    }
                }
            } else {
                field[i][j] = field[i][j] || 0
            }
        }
    }

    return { field, bombs }
}

const createPublicField = () => {
    const field = []

    for (let i = 0; i < SAPPER_WIDTH; i += 1) {
        field[i] = []
        for (let j = 0; j < SAPPER_HEIGHT; j += 1) {
            field[i][j] = STATUSES.closed
        }
    }

    return field
}

const changeFields = (field, sapper, [x, y], status, player) => {
    if (status === STATUSES.flagged) {
        if (sapper.field[x][y] === STATUSES.flagged) {
            sapper.field[x][y] = STATUSES.closed
        } else {
            sapper.field[x][y] = STATUSES.flagged
        }
    } else if (status === STATUSES.opened) {
        if (field[x][y] === STATUSES.bomb) {
            sapper.field[x][y] = `${STATUSES.dead}:${player.name}`
            player.dead = true
        } else {
            sapper.field[x][y] = `${field[x][y]}:${player.name}`
            player.opened += 1
        }
    }

    sapper.history.push({
        sector: [x, y],
        status: sapper.field[x][y],
    })
}

const startSapperGame = (room) => {
    room.games.sapper = {
        players: Object.values(room.users)
            .filter(({ online }) => online)
            .map(({ name }) => ({
                name,
                dead: false,
                opened: 0,
            })),
        action: 'start',
        width: SAPPER_WIDTH,
        height: SAPPER_HEIGHT,
        field: createPublicField(),
        history: [],
    }

    sendAllUpdate(room, ['games'])
}

const editSapperGame = (room, userId, msg) => {
    if (room.games.sapper) {
        if (room.games.sapper.action === 'start') {
            room.gamesPrivate.sapper = createPrivateField(msg.sector)
        }
        room.games.sapper.action = 'edit'
        const userName = room.users[userId].name
        const player = room.games.sapper.players.find(({ name }) => userName === name)
        if (player && !player.dead) {
            changeFields(
                room.gamesPrivate.sapper.field,
                room.games.sapper,
                msg.sector,
                STATUSES[msg.status],
                player,
            )

            let bombCells = 0
            let closedCells = 0
            room.games.sapper.field.forEach((row) => {
                row.forEach((cell) => {
                    if ((cell === STATUSES.flagged || cell.startsWith(STATUSES.dead))) {
                        bombCells += 1
                    } else if (cell === STATUSES.closed) {
                        closedCells += 1
                    }
                })
            })

            if ((!closedCells && room.gamesPrivate.sapper.bombs === bombCells)
                || room.games.sapper.players.every(({ dead }) => dead)) {
                room.games.sapper.field = room.gamesPrivate.sapper.field
                room.games.sapper.action = 'stop'
            }
        }

        sendAllUpdate(room, ['games'])
    }
}

module.exports = (room, msg, userId) => {
    if (msg.action === 'start' && userId === room.adminId) {
        startSapperGame(room, msg)
    } else if (msg.action === 'edit') {
        editSapperGame(room, userId, msg)
    } else if (msg.action === 'stop') {
        delete room.games.sapper
    }
}
