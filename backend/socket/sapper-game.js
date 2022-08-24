const SAPPER_WIDTH = 16
const SAPPER_HEIGHT = 16
const SAPPER_BOMBS_RATE = 1 / 8
const STATUSES = {
    unknown: 'unknown',
    flagged: 'flagged',
    opened: 'opened',
    closed: 'closed',
    bomb: 'bomb',
    dead: 'dead'
}

const createPrivateField = () => {
    let privateField = []

    for (let i = 0; i < SAPPER_WIDTH; i += 1) {
        privateField[i] = []

        for (let j = 0; j < SAPPER_HEIGHT; j += 1) {
            // TODO: no random please
            privateField[i][j] = Math.random() <= SAPPER_BOMBS_RATE ? STATUSES.bomb : STATUSES.closed
        }
    }

    return privateField
}

const createPublicField = (privateField) => {
    let publicField = []

    for (let i = 0; i < SAPPER_WIDTH; i += 1) {
        publicField[i] = []
        for (let j = 0; j < SAPPER_HEIGHT; j += 1) {
            // Optimization
            if (privateField[i][j] === STATUSES.opened) {
                publicField[i][j] = 0
                if (privateField[i - 1]?.[j - 1] === STATUSES.bomb) publicField[i][j]++
                if (privateField[i    ]?.[j - 1] === STATUSES.bomb) publicField[i][j]++
                if (privateField[i + 1]?.[j - 1] === STATUSES.bomb) publicField[i][j]++
                if (privateField[i + 1]?.[j    ] === STATUSES.bomb) publicField[i][j]++
                if (privateField[i + 1]?.[j + 1] === STATUSES.bomb) publicField[i][j]++
                if (privateField[i    ]?.[j + 1] === STATUSES.bomb) publicField[i][j]++
                if (privateField[i - 1]?.[j + 1] === STATUSES.bomb) publicField[i][j]++
                if (privateField[i - 1]?.[j    ] === STATUSES.bomb) publicField[i][j]++
            } else if (privateField[i][j] === STATUSES.bomb) {
                publicField[i][j] = STATUSES.closed
            } else {
                publicField[i][j] = privateField[i][j]
            }
        }
    }

    return publicField
}

const changePrivateField = (privateField, [x, y], status, alivePlayers, name) => {
    if (status === STATUSES.flagged) {
        // TODO: flagged
    } else if (status === STATUSES.opened) {
        if (privateField[x][y] === STATUSES.bomb) {
            alivePlayers.splice(alivePlayers.indexOf(name), 1)
            privateField[x][y] = STATUSES.dead
        } else {
            privateField[x][y] = STATUSES.opened
        }
    }
}

const startSapperGame = (room) => {
    room.sapperPrivateField = createPrivateField()
    room.sapper = {
        alivePlayers: Object.values(room.users).map(({ name }) => name),
        action: 'tick',
        width: SAPPER_WIDTH,
        height: SAPPER_HEIGHT,
        field: createPublicField(room.sapperPrivateField)
    }
}

const editSapperGame = (room, msg, userId, cb) => {
    if (room.sapper && room.sapper.alivePlayers.includes(room.users[userId].name)) {
        changePrivateField(room.sapperPrivateField, msg.sector, STATUSES[msg.status], room.sapper.alivePlayers, room.users[userId])

        room.sapper.field = createPublicField(room.sapperPrivateField)

        if (!room.sapper.alivePlayers.length) {
            cb()
            delete room.sapper
        }
    }
}

module.exports = {
    startSapperGame,
    editSapperGame
}