const SAPPER_WIDTH = 16
const SAPPER_HEIGHT = 16
const SAPPER_RATES = [1 / 8, 1 / 6, 1 / 4, 1 / 3]
const SAPPER_BOMBS_RATE = SAPPER_RATES[Math.floor(Math.random() * SAPPER_RATES.length)]
const STATUSES = {
    unknown: 'unknown',
    flagged: 'flagged',
    opened: 'opened',
    closed: 'closed',
    bomb: 'bomb',
    dead: 'dead'
}

const createPrivateField = ([x, y]) => {
    let privateField = []
    let bombs = 0

    for (let i = 0; i < SAPPER_WIDTH; i += 1) {
        privateField[i] = []

        for (let j = 0; j < SAPPER_HEIGHT; j += 1) {
            // TODO: no random please
            if (x === i && y === j) {
                privateField[i][j] = 0
            } else if (Math.random() <= SAPPER_BOMBS_RATE) {
                privateField[i][j] = STATUSES.bomb
                bombs += 1
            } else {
                privateField[i][j] = 0
            }
        }
    }
    
    for (let i = 0; i < SAPPER_WIDTH; i += 1) {
        for (let j = 0; j < SAPPER_HEIGHT; j += 1) {
            // Optimization
            if (privateField[i][j] !== STATUSES.bomb) {
                if (privateField[i - 1]?.[j - 1] === STATUSES.bomb) privateField[i][j] += 1
                if (privateField[i    ]?.[j - 1] === STATUSES.bomb) privateField[i][j] += 1
                if (privateField[i + 1]?.[j - 1] === STATUSES.bomb) privateField[i][j] += 1
                if (privateField[i + 1]?.[j    ] === STATUSES.bomb) privateField[i][j] += 1
                if (privateField[i + 1]?.[j + 1] === STATUSES.bomb) privateField[i][j] += 1
                if (privateField[i    ]?.[j + 1] === STATUSES.bomb) privateField[i][j] += 1
                if (privateField[i - 1]?.[j + 1] === STATUSES.bomb) privateField[i][j] += 1
                if (privateField[i - 1]?.[j    ] === STATUSES.bomb) privateField[i][j] += 1
            }
        }
    }

    return { field: privateField, bombs }
}

const createPublicField = () => {
    let publicField = []

    for (let i = 0; i < SAPPER_WIDTH; i += 1) {
        publicField[i] = []
        for (let j = 0; j < SAPPER_HEIGHT; j += 1) {
            publicField[i][j] = STATUSES.closed
        }
    }

    return publicField
}

const changeFields = (privateField, publicField, [x, y], status, player) => {
    if (status === STATUSES.flagged) {
        if (publicField[x][y] === STATUSES.flagged) {
            publicField[x][y] = STATUSES.closed
        } else {
            publicField[x][y] = STATUSES.flagged
        }
    } else if (status === STATUSES.opened) {
        if (privateField[x][y] === STATUSES.bomb) {
            publicField[x][y] = `${STATUSES.dead}:${player.name}`
            player.dead = true
        } else {
            publicField[x][y] = `${privateField[x][y]}:${player.name}`
            player.opened += 1
        }
    }
}

const startSapperGame = (room) => {
    room.sapper = {
        players: Object.values(room.users).map(({ name }) => ({
            name,
            dead: false,
            opened: 0
        })),
        action: 'tick',
        width: SAPPER_WIDTH,
        height: SAPPER_HEIGHT,
        field: createPublicField(),
        started: false
    }
}

const editSapperGame = (room, userId, msg) => {
    if (room.sapper) {
        if (!room.sapper.started) {
            const { field, bombs } = createPrivateField(msg.sector)
            room.sapperPrivateField = field
            room.sapperBombs = bombs
            room.sapper.started = true
        }
        const userName = room.users[userId].name
        const player = room.sapper.players.find(({ name }) => userName === name)
        if (player && !player.dead) {
            changeFields(
                room.sapperPrivateField,
                room.sapper.field,
                msg.sector,
                STATUSES[msg.status],
                player
            )

            let restCells = 0
            room.sapper.field.forEach((row) => {
                row.forEach((cell) => {
                    if (cell === STATUSES.flagged || cell.startsWith(STATUSES.dead)) {
                        restCells += 1
                    }
                })
            })

            if (room.sapperBombs === restCells || room.sapper.players.every(({ dead }) => dead)) {
                room.sapper.action = 'stop'
            }
        }
    }
}

module.exports = {
    startSapperGame,
    editSapperGame
}