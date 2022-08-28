import { state, nodes } from '../state'

import { createGameButton, showGameField, hideGameField } from './utils'

if (state.admin) {
    createGameButton('Games: Sapper', () => {
        state.sendDataUpdate({
            action: 'start',
            type: 'game',
            name: 'sapper',
        })
    })
}

const DEAD_EMOJIES = ['💀', '☠️', '👻', '⚰️', '💩', '😭', '💔']
const FLAG_EMOJIES = ['🚩', '🔺', '📛', '💣', '🧨', '🖕', '⚒️']
const ALIVE_EMOJIES = ['👶', '👴🏻', '👳🏻', '❤️', '🤗', '😁', '😏', '😎']
let deadEmoji = DEAD_EMOJIES[0]
let flagEmoji = FLAG_EMOJIES[0]
let aliveEmoji = ALIVE_EMOJIES[0]

let field
let ownPlayerMeta
let fieldButtons
let score

const SAPPER_COLORS = [
    'transparent',
    'blue',
    'green',
    'yellow',
    'darkorange',
    'red',
    'red',
    'darkred',
    'darkred',
]

const createHandler = (status) => (event) => {
    if (event.target.tagName === 'BUTTON') {
        event.preventDefault()
        const x = [...event.target.parentNode.parentNode.childNodes]
            .indexOf(event.target.parentNode)
        const y = [...event.target.parentNode.childNodes]
            .indexOf(event.target)

        if (fieldButtons[x][y].classList.contains('sapperBtnClosed')
            || fieldButtons[x][y].classList.contains('sapperBtnFlagged')) {
            state.sendDataUpdate({
                type: 'game',
                name: 'sapper',
                action: 'edit',
                status,
                sector: [x, y],
            })
        }
    }
}

const openHandler = createHandler('opened')
const flagHandler = createHandler('flagged')

const updateCell = ({ sector: [x, y], status }) => {
    const btn = fieldButtons[x][y]

    if (/^\d:/.test(status)) {
        const [rate, name] = status.split(':')
        btn.innerHTML = rate
        btn.title = name
        btn.disabled = true
        btn.classList.add('sapperBtnOpened')
        btn.classList.remove('sapperBtnClosed')
        btn.style.color = SAPPER_COLORS[rate]
    } else if (/^\d/.test(status)) {
        const [rate] = status.split(':')
        btn.innerHTML = rate
        btn.disabled = true
        btn.classList.add('sapperBtnOpened')
        btn.style.color = SAPPER_COLORS[rate]
    } else if (/^dead:/.test(status)) {
        const [, name] = status.split(':')
        btn.innerHTML = deadEmoji
        btn.title = name
        btn.disabled = true
        btn.classList.add('sapperBtnBomb')
        btn.classList.remove('sapperBtnClosed')
    } else if (/^bomb/.test(status)) {
        btn.innerHTML = deadEmoji
        btn.disabled = true
        btn.classList.remove('sapperBtnClosed')
    } else if (status === 'flagged') {
        btn.classList.add('sapperBtnFlagged')
        btn.classList.remove('sapperBtnClosed')
        btn.innerHTML = flagEmoji
        btn.disabled = true
    } else {
        btn.classList.add('sapperBtnClosed')
        btn.innerHTML = ''
        btn.disabled = false
    }
}

const redrawField = (data) => {
    if (ownPlayerMeta.dead) {
        field.removeEventListener('click', openHandler)
        field.removeEventListener('contextmenu', flagHandler)
    }

    score.innerHTML = ''
    data.players.forEach(({ name, dead, opened }) => {
        const player = document.createElement('li')
        player.innerHTML = `${name} [${dead ? deadEmoji : aliveEmoji}]: ${opened}`
        score.appendChild(player)
    })

    data.history.forEach(updateCell)
}

export const startSapperGame = (data) => {
    if (field) {
        field.removeEventListener('click', openHandler)
        field.removeEventListener('contextmenu', flagHandler)
    }

    nodes.gameField.innerHTML = ''

    deadEmoji = DEAD_EMOJIES[Math.floor(Math.random() * DEAD_EMOJIES.length)]
    flagEmoji = FLAG_EMOJIES[Math.floor(Math.random() * FLAG_EMOJIES.length)]
    aliveEmoji = ALIVE_EMOJIES[Math.floor(Math.random() * ALIVE_EMOJIES.length)]

    ownPlayerMeta = data.players.find(({ name }) => name === state.choosenName)

    field = document.createElement('div')
    field.classList.add('sapperField')
    field.addEventListener('click', openHandler)
    field.addEventListener('contextmenu', flagHandler)

    score = document.createElement('ul')

    for (let i = 0; i < data.width; i += 1) {
        const row = document.createElement('div')
        row.classList.add('sapperRow')

        for (let j = 0; j < data.height; j += 1) {
            const btn = document.createElement('button')
            btn.type = 'button'
            btn.title = data.field[i][j]
            btn.classList.add('sapperBtn')
            btn.classList.add('sapperBtnClosed')
            row.appendChild(btn)

            if (!fieldButtons) {
                fieldButtons = []
            }
            if (!fieldButtons[i]) {
                fieldButtons[i] = []
            }
            fieldButtons[i][j] = btn
        }

        field.appendChild(row)
        nodes.gameField.appendChild(field)
    }

    nodes.gameField.appendChild(score)

    showGameField()
}

export const tickSapperGame = (data) => {
    if (!ownPlayerMeta) {
        startSapperGame(data)
    }
    redrawField(data)
}

export const stopSapperGame = (data) => {
    const closeBtn = document.createElement('button')
    closeBtn.type = 'button'
    closeBtn.innerHTML = 'Close'
    closeBtn.classList.add('userBtn')
    closeBtn.classList.add('closeBtn')

    data.field.forEach((row, i) => {
        row.forEach((status, j) => {
            updateCell({ sector: [i, j], status: String(status) })
        })
    })

    closeBtn.addEventListener('click', () => {
        nodes.gameField.innerHTML = ''

        hideGameField()

        state.sendDataUpdate({
            type: 'game',
            name: 'sapper',
            action: 'stop',
        })
    })

    nodes.gameField.appendChild(closeBtn)
}
