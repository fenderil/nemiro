// Write here your game frontend

const createGameButton = (title, handler) => {
    const button = document.createElement('button')
    button.type = 'button'
    button.classList.add('userBtn')
    button.innerText = title
    button.addEventListener('click', handler)
    gamesButtons.appendChild(button)
}

if (admin) {
    createGameButton('Games: Crocodile', () => {
        toggleTimerState(false)
        sendDataUpdate({
            action: 'start',
            type: 'game',
            name: 'crocodile'
        })
    })
    createGameButton('Games: Sapper', () => {
        sendDataUpdate({
            action: 'start',
            type: 'game',
            name: 'sapper'
        })
    })
}

const DEAD_EMOJIES = ['💀', '☠️', '👻', '⚰️', '💩', '😭', '💔']
const FLAG_EMOJIES = ['🚩', '🔺', '📛', '💣', '🧨', '🖕', '⚒️']
const ALIVE_EMOJIES = ['👶', '👴🏻', '👳🏻', '❤️', '🤗', '😁', '😏', '😎']
let deadEmoji = DEAD_EMOJIES[0]
let flagEmoji = FLAG_EMOJIES[0]
let aliveEmoji = ALIVE_EMOJIES[0]

const game = (data) => {
    if (data.games.crocodile) {
        startCrocodileGame(data.games.crocodile)
    }

    if (data.games.sapper && data.games.sapper.action === 'start') {
        deadEmoji = DEAD_EMOJIES[Math.floor(Math.random() * DEAD_EMOJIES.length)]
        flagEmoji = FLAG_EMOJIES[Math.floor(Math.random() * FLAG_EMOJIES.length)]
        aliveEmoji = ALIVE_EMOJIES[Math.floor(Math.random() * ALIVE_EMOJIES.length)]
    }

    if (data.games.sapper) {
        tickSapperGame(data.games.sapper)
    }

    if (data.games.sapper && data.games.sapper.action === 'stop') {
        stopSapperGame(data.games.sapper)
    }
}

// Crocodile
const startCrocodileGame = (secretWord) => {
    if (secretWord) {
        gameField.innerHTML = secretWord
        gameField.classList.remove('hidden')

        setTimeout(() => {
            gameField.innerHTML = ''
            gameField.classList.add('hidden')
            
            sendDataUpdate({
                action: 'stop',
                type: 'game',
                name: 'crocodile',
            })
        }, 10 * 1000)
    }
}

// Sapper
const SAPPER_COLORS = [
    'transparent',
    'blue',
    'green',
    'yellow',
    'orange',
    'red',
    'red',
    'darkred',
    'darkred',
]

const redrawField = (data) => {
    // TODO: removeChild
    gameField.innerHTML = ''
    const ownPlayerMeta = data.players.find(({ name }) => name === choosenName)

    const field = document.createElement('div')

    field.classList.add('sapperField')

    if (!ownPlayerMeta.dead) {
        field.addEventListener('click', (event) => {
            if (event.target.tagName === 'BUTTON') {
                event.preventDefault()
                const x = [...event.target.parentNode.parentNode.childNodes].indexOf(event.target.parentNode)
                const y = [...event.target.parentNode.childNodes].indexOf(event.target)
                sendDataUpdate({
                    action: 'edit',
                    type: 'game',
                    name: 'sapper',
                    status: 'opened',
                    sector: [x, y],
                })
            }
        })

        field.addEventListener('contextmenu', (event) => {
            if (event.target.tagName === 'BUTTON') {
                event.preventDefault()
                const x = [...event.target.parentNode.parentNode.childNodes].indexOf(event.target.parentNode)
                const y = [...event.target.parentNode.childNodes].indexOf(event.target)
                sendDataUpdate({
                    action: 'edit',
                    type: 'game',
                    name: 'sapper',
                    status: 'flagged',
                    sector: [x, y],
                })
            }
        })
    }

    for (let i = 0; i < data.width; i += 1) {
        const row = document.createElement('div')
        row.classList.add('sapperRow')

        for (let j = 0; j < data.height; j += 1) {
            const btn = document.createElement('button')
            btn.type = 'button'
            btn.title = data.field[i][j]
            btn.classList.add('sapperBtn')

            if (/^\d:/.test(data.field[i][j])) {
                const [rate, name] = data.field[i][j].split(':')
                btn.innerHTML = rate
                btn.title = name
                btn.disabled = true
                btn.classList.add('sapperOpened')
                btn.style.color = SAPPER_COLORS[rate]
            } else if (/^dead:/.test(data.field[i][j])) {
                const [, name] = data.field[i][j].split(':')
                btn.innerHTML = deadEmoji
                btn.title = name
                btn.disabled = true
                btn.classList.add('sapperBomb')
            } else if (data.field[i][j] === 'flagged') {
                btn.innerHTML = flagEmoji
                btn.disabled = true
            }

            row.appendChild(btn)
        }

        field.appendChild(row)
        gameField.appendChild(field)
    }
    const score = document.createElement('ul')
    data.players.forEach(({ name, dead, opened }) => {
        const player = document.createElement('li')
        player.innerHTML = `${name} [${dead ? deadEmoji : aliveEmoji}]: ${opened}`
        score.appendChild(player)
    })

    gameField.appendChild(score)
}

const tickSapperGame = (data) => {
    gameField.classList.remove('hidden')
    redrawField(data)
}

const stopSapperGame = () => {
    const closeBtn = document.createElement('button')
    closeBtn.type = 'button'
    closeBtn.innerHTML = 'Close'
    closeBtn.classList.add('userBtn')
    closeBtn.classList.add('closeBtn')
    closeBtn.addEventListener('click', () => {
        gameField.innerHTML = ''
        gameField.classList.add('hidden')
        
        sendDataUpdate({
            action: 'stop',
            type: 'game',
            name: 'sapper',
        })
    })
    gameField.appendChild(closeBtn)
}
