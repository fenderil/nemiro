import { state } from '../../data/state'
import { nodes } from '../../data/nodes'

import {
    appendGameButton,
    showGameField,
    appendCloseButton,
} from './utils'
import './tetris.css'
import { DATA_ACTIONS, DATA_TYPES } from '../../data/constants'

appendGameButton('tetris')

const CELL_SIZE = 16

let selfPlayerMeta
let score
let tetrisCanvas
let canvasContext
let upButton
let leftButton
let downButton
let rightButton

const createButton = (name) => {
    const button = document.createElement('button')
    button.type = 'button'
    button.innerHTML = name
    button.classList.add('tetrisBtn')
    return button
}

const createHandler = (direction) => () => {
    state.sendDataUpdate({
        type: DATA_TYPES.game,
        action: DATA_ACTIONS.edit,
        name: 'tetris',
        direction,
    })
}

const upHandler = createHandler('up')
const leftHandler = createHandler('left')
const downHandler = createHandler('down')
const rightHandler = createHandler('right')

const createKeyboardHandler = (keyCode, handler) => (event) => {
    if (keyCode.includes(event.code)) {
        event.preventDefault()
        handler(event)
    }
}

const upKeyboardHandler = createKeyboardHandler(['ArrowUp', 'KeyW'], upHandler)
const leftKeyboardHandler = createKeyboardHandler(['ArrowLeft', 'KeyA'], leftHandler)
const downKeyboardHandler = createKeyboardHandler(['ArrowDown', 'KeyS'], downHandler)
const rightKeyboardHandler = createKeyboardHandler(['ArrowRight', 'KeyD'], rightHandler)

const redrawField = (data) => {
    canvasContext.clearRect(0, 0, tetrisCanvas.width, tetrisCanvas.height)

    data.field.forEach((row, i) => {
        row.forEach((cell, j) => {
            if (cell) {
                canvasContext.beginPath()
                canvasContext.fillStyle = cell
                canvasContext.rect(j * CELL_SIZE + 1, i * CELL_SIZE + 1, CELL_SIZE - 2, CELL_SIZE - 2)
                canvasContext.fill()
            }
        })
    })

    canvasContext.restore()
    canvasContext.save()

    canvasContext.strokeStyle = data.players[data.activePlayerIndex].color
    data.activePoints.forEach(([y, x]) => {
        canvasContext.beginPath()
        canvasContext.rect(x * CELL_SIZE + 4, y * CELL_SIZE + 4, CELL_SIZE - 8, CELL_SIZE - 8)
        canvasContext.stroke()
    })

    canvasContext.restore()
    canvasContext.save()

    score.innerHTML = ''
    data.players.forEach(({ name, color, score: userScore }) => {
        const player = document.createElement('li')
        const playerCells = data.field
            .reduce((memo, row) => memo + row
                .reduce((memo2, cell) => {
                    if (cell === color) {
                        return memo2 + 1
                    }
                    return memo2
                }, 0), 0)
        player.innerHTML = `${name} [${playerCells}]: ${userScore}`
        player.style.color = color
        score.appendChild(player)
    })
}

const disableGame = () => {
    upButton.disabled = true
    leftButton.disabled = true
    downButton.disabled = true
    rightButton.disabled = true
    upButton.removeEventListener('click', upHandler)
    leftButton.removeEventListener('click', leftHandler)
    downButton.removeEventListener('click', downHandler)
    rightButton.removeEventListener('click', rightHandler)
    window.removeEventListener('keydown', upKeyboardHandler)
    window.removeEventListener('keydown', leftKeyboardHandler)
    window.removeEventListener('keydown', downKeyboardHandler)
    window.removeEventListener('keydown', rightKeyboardHandler)
}

const startTetrisGame = (data) => {
    nodes.gameField.innerHTML = ''

    const arena = document.createElement('div')
    arena.classList.add('tetrisField')
    arena.style.width = `${data.width * CELL_SIZE + 2}px`
    arena.style.height = `${data.height * CELL_SIZE + 2}px`

    score = document.createElement('ul')
    score.classList.add('score')

    tetrisCanvas = document.createElement('canvas')
    tetrisCanvas.width = data.width * CELL_SIZE
    tetrisCanvas.height = data.height * CELL_SIZE
    tetrisCanvas.classList.add('tetrisCanvas')
    canvasContext = tetrisCanvas.getContext('2d')
    canvasContext.lineWidth = 1
    canvasContext.save()

    upButton = createButton('🔼')
    leftButton = createButton('◀️')
    downButton = createButton('🔽')
    rightButton = createButton('▶️')

    upButton.addEventListener('click', upHandler)
    leftButton.addEventListener('click', leftHandler)
    downButton.addEventListener('click', downHandler)
    rightButton.addEventListener('click', rightHandler)
    window.addEventListener('keydown', upKeyboardHandler)
    window.addEventListener('keydown', leftKeyboardHandler)
    window.addEventListener('keydown', downKeyboardHandler)
    window.addEventListener('keydown', rightKeyboardHandler)

    const controls = document.createElement('div')
    controls.classList.add('tetrisControls')
    upButton.classList.add('tetrisUp')
    leftButton.classList.add('tetrisLeft')
    downButton.classList.add('tetrisDown')
    rightButton.classList.add('tetrisRight')
    controls.appendChild(upButton)
    controls.appendChild(leftButton)
    controls.appendChild(downButton)
    controls.appendChild(rightButton)
    arena.appendChild(tetrisCanvas)

    nodes.gameField.appendChild(arena)
    nodes.gameField.appendChild(controls)
    nodes.gameField.appendChild(score)

    showGameField()
}

const tickTetrisGame = (data) => {
    if (!selfPlayerMeta) {
        startTetrisGame(data)

        if (state.admin) {
            appendCloseButton('tetris')
        }
    }

    selfPlayerMeta = data.players.find(({ name }) => name === state.userName)

    redrawField(data)
}

const stopTetrisGame = () => {
    disableGame()

    appendCloseButton('tetris')
}

export const tetris = (data = {}) => {
    if (data.action === DATA_ACTIONS.start) {
        startTetrisGame(data)
    }

    tickTetrisGame(data)

    if (data.action === DATA_ACTIONS.stop) {
        stopTetrisGame(data)
    }
}
