import { state, nodes } from '../state'

import {
    appendGameButton,
    showGameField,
    getEmojies,
    setEmojies,
    appendCloseButton,
} from './utils'
import './sapper.css'
import { DATA_ACTIONS, DATA_TYPES } from '../constants'

appendGameButton('sapper')

let field
let selfPlayerMeta
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
                type: DATA_TYPES.game,
                name: 'sapper',
                action: DATA_ACTIONS.edit,
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
        btn.innerHTML = getEmojies('dead')
        btn.title = name
        btn.disabled = true
        btn.classList.add('sapperBtnBomb')
        btn.classList.remove('sapperBtnClosed')
    } else if (/^bomb/.test(status)) {
        btn.innerHTML = getEmojies('dead')
        btn.disabled = true
        btn.classList.remove('sapperBtnClosed')
    } else if (status === 'flagged') {
        btn.classList.add('sapperBtnFlagged')
        btn.classList.remove('sapperBtnClosed')
        btn.innerHTML = getEmojies('flag')
        btn.disabled = true
    } else {
        btn.classList.add('sapperBtnClosed')
        btn.innerHTML = ''
        btn.disabled = false
    }
}

const redrawField = (data) => {
    if (selfPlayerMeta.dead) {
        field.removeEventListener('click', openHandler)
        field.removeEventListener('contextmenu', flagHandler)
    }

    score.innerHTML = ''
    data.players.forEach(({ name, dead, opened }) => {
        const player = document.createElement('li')
        player.innerHTML = `${name} [${dead ? getEmojies('dead') : getEmojies('alive')}]: ${opened}`
        score.appendChild(player)
    })

    data.history.forEach(updateCell)
}

const startSapperGame = (data) => {
    if (field) {
        field.removeEventListener('click', openHandler)
        field.removeEventListener('contextmenu', flagHandler)
    }

    nodes.gameField.innerHTML = ''

    setEmojies()

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

const tickSapperGame = (data) => {
    if (!selfPlayerMeta) {
        if (state.admin) {
            appendCloseButton('sapper')
        }

        startSapperGame(data)
    }

    selfPlayerMeta = data.players.find(({ name }) => name === state.choosenName)

    redrawField(data)
}

const stopSapperGame = (data) => {
    data.field.forEach((row, i) => {
        row.forEach((status, j) => {
            updateCell({ sector: [i, j], status: String(status) })
        })
    })

    appendCloseButton('sapper')
}

export const sapper = (data = {}) => {
    if (data.action === DATA_ACTIONS.start) {
        startSapperGame(data)
    }

    tickSapperGame(data)

    if (data.action === DATA_ACTIONS.stop) {
        stopSapperGame(data)
    }
}
