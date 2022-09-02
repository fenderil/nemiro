import { state, nodes } from '../state'

import {
    appendGameButton,
    showGameField,
    getEmojies,
    setEmojies,
    appendCloseButton,
} from './utils'
import './tron.css'

appendGameButton('tron')

let arena
let selfPlayerMeta
let score
let tronCanvas
let canvasContext
let upButton
let leftButton
let downButton
let rightButton

const createButton = (name) => {
    const button = document.createElement('button')
    button.type = 'button'
    button.innerHTML = name
    button.classList.add('tronBtn')
    return button
}

const createHandler = (direction) => () => {
    state.sendDataUpdate({
        type: 'game',
        name: 'tron',
        action: 'edit',
        direction,
    })
}

const upHandler = createHandler('up')
const leftHandler = createHandler('left')
const downHandler = createHandler('down')
const rightHandler = createHandler('right')

const createKeyboardHandler = (keyCode, handler) => (event) => {
    if (event.key === keyCode) {
        event.preventDefault()
        handler(event)
    }
}

const upKeyboardHandler = createKeyboardHandler('ArrowUp', upHandler)
const leftKeyboardHandler = createKeyboardHandler('ArrowLeft', leftHandler)
const downKeyboardHandler = createKeyboardHandler('ArrowDown', downHandler)
const rightKeyboardHandler = createKeyboardHandler('ArrowRight', rightHandler)

const drawTron = (points, color, dead, self) => {
    const reservedFillColor = canvasContext.fillStyle
    canvasContext.fillStyle = dead ? 'black' : color
    const [lastPointX, lastPointY] = points[points.length - 1]
    const [preLastPointX, preLastPointY] = points[points.length - 2]

    canvasContext.beginPath()
    if (lastPointX > preLastPointX) {
        canvasContext.moveTo(lastPointX + 2, lastPointY)
        canvasContext.lineTo(lastPointX - 6, lastPointY + 3)
        canvasContext.lineTo(lastPointX - 6, lastPointY - 3)
        canvasContext.lineTo(lastPointX + 2, lastPointY)

        if (self) {
            upButton.innerHTML = '🔼'
            leftButton.innerHTML = '⛔'
            downButton.innerHTML = '🔽'
            rightButton.innerHTML = '⏩'
        }
    } else if (lastPointX < preLastPointX) {
        canvasContext.moveTo(lastPointX - 2, lastPointY)
        canvasContext.lineTo(lastPointX + 6, lastPointY + 3)
        canvasContext.lineTo(lastPointX + 6, lastPointY - 3)
        canvasContext.lineTo(lastPointX - 2, lastPointY)

        if (self) {
            upButton.innerHTML = '🔼'
            leftButton.innerHTML = '⏪'
            downButton.innerHTML = '🔽'
            rightButton.innerHTML = '⛔'
        }
    } else if (lastPointY > preLastPointY) {
        canvasContext.moveTo(lastPointX, lastPointY + 2)
        canvasContext.lineTo(lastPointX + 3, lastPointY - 6)
        canvasContext.lineTo(lastPointX - 3, lastPointY - 6)
        canvasContext.lineTo(lastPointX, lastPointY + 2)

        if (self) {
            upButton.innerHTML = '⛔'
            leftButton.innerHTML = '◀️'
            downButton.innerHTML = '⏬'
            rightButton.innerHTML = '▶️'
        }
    } else if (lastPointY < preLastPointY) {
        canvasContext.moveTo(lastPointX, lastPointY - 2)
        canvasContext.lineTo(lastPointX + 3, lastPointY + 6)
        canvasContext.lineTo(lastPointX - 3, lastPointY + 6)
        canvasContext.lineTo(lastPointX, lastPointY - 2)

        if (self) {
            upButton.innerHTML = '⏫'
            leftButton.innerHTML = '◀️'
            downButton.innerHTML = '⛔'
            rightButton.innerHTML = '▶️'
        }
    }
    canvasContext.fill()
    canvasContext.fillStyle = reservedFillColor
}

const redrawField = (data) => {
    canvasContext.clearRect(0, 0, tronCanvas.width, tronCanvas.height)

    score.innerHTML = ''
    data.players.forEach(({
        name,
        points,
        color,
        dead,
    }) => {
        const reservedFillColor = canvasContext.fillStyle
        const reservedStrokeColor = canvasContext.strokeStyle
        canvasContext.fillStyle = color
        canvasContext.strokeStyle = color

        canvasContext.beginPath()
        canvasContext.moveTo(points[0][0], points[0][1])
        points.forEach((point) => {
            canvasContext.lineTo(point[0], point[1])
        })
        canvasContext.stroke()

        drawTron(points, color, dead, name === state.choosenName)

        canvasContext.fillStyle = reservedFillColor
        canvasContext.strokeColor = reservedStrokeColor

        const player = document.createElement('li')
        player.innerHTML = `${name} [${dead ? getEmojies('dead') : getEmojies('alive')}]`
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

export const startTronGame = (data) => {
    nodes.gameField.innerHTML = ''

    setEmojies()

    arena = document.createElement('div')
    arena.classList.add('tronField')
    arena.style.width = `${data.width + 2}px`
    arena.style.height = `${data.height + 2}px`

    score = document.createElement('ul')

    tronCanvas = document.createElement('canvas')
    tronCanvas.width = data.width
    tronCanvas.height = data.height
    tronCanvas.classList.add('tronCanvas')
    canvasContext = tronCanvas.getContext('2d')
    canvasContext.lineWidth = 1

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
    controls.classList.add('tronControls')
    upButton.classList.add('tronUp')
    leftButton.classList.add('tronLeft')
    downButton.classList.add('tronDown')
    rightButton.classList.add('tronRight')
    controls.appendChild(upButton)
    controls.appendChild(leftButton)
    controls.appendChild(downButton)
    controls.appendChild(rightButton)
    arena.appendChild(tronCanvas)

    nodes.gameField.appendChild(arena)
    nodes.gameField.appendChild(controls)
    nodes.gameField.appendChild(score)

    showGameField()
}

export const tickTronGame = (data) => {
    if (!selfPlayerMeta) {
        if (state.admin) {
            appendCloseButton('tron')
        }

        startTronGame(data)
    }

    selfPlayerMeta = data.players.find(({ name }) => name === state.choosenName)

    if (selfPlayerMeta.dead) {
        disableGame()
    }

    redrawField(data)
}

export const stopTronGame = () => {
    disableGame()

    appendCloseButton('tron')
}
