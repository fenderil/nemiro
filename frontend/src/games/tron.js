import { state, nodes } from '../state'

import { createGameButton, showGameField, hideGameField } from './utils'

if (state.admin) {
    createGameButton('Games: Tron', () => {
        state.sendDataUpdate({
            action: 'start',
            type: 'game',
            name: 'tron',
        })
    })
}

let field
let ownPlayerMeta
let score
let tronCanvas
let canvasContext
let controls
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

const DEAD_EMOJIES = ['💀', '☠️', '👻', '⚰️', '💩', '😭', '💔']
const ALIVE_EMOJIES = ['👶', '👴🏻', '👳🏻', '❤️', '🤗', '😁', '😏', '😎']
let deadEmoji = DEAD_EMOJIES[0]
let aliveEmoji = ALIVE_EMOJIES[0]

const drawTron = (points, color, dead) => {
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
    } else if (lastPointX < preLastPointX) {
        canvasContext.moveTo(lastPointX - 2, lastPointY)
        canvasContext.lineTo(lastPointX + 6, lastPointY + 3)
        canvasContext.lineTo(lastPointX + 6, lastPointY - 3)
        canvasContext.lineTo(lastPointX - 2, lastPointY)
    } else if (lastPointY > preLastPointY) {
        canvasContext.moveTo(lastPointX, lastPointY + 2)
        canvasContext.lineTo(lastPointX + 3, lastPointY - 6)
        canvasContext.lineTo(lastPointX - 3, lastPointY - 6)
        canvasContext.lineTo(lastPointX, lastPointY + 2)
    } else if (lastPointY < preLastPointY) {
        canvasContext.moveTo(lastPointX, lastPointY - 2)
        canvasContext.lineTo(lastPointX + 3, lastPointY + 6)
        canvasContext.lineTo(lastPointX - 3, lastPointY + 6)
        canvasContext.lineTo(lastPointX, lastPointY - 2)
    }
    canvasContext.fill()
    canvasContext.fillStyle = reservedFillColor
}

const redrawField = (data) => {
    canvasContext.clearRect(0, 0, tronCanvas.width, tronCanvas.height)

    data.players.forEach(({ points, color, dead }) => {
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

        drawTron(points, color, dead)

        canvasContext.fillStyle = reservedFillColor
        canvasContext.strokeColor = reservedStrokeColor
    })

    score.innerHTML = ''
    data.players.forEach(({ name, dead, color }) => {
        const player = document.createElement('li')
        player.innerHTML = `${name} [${dead ? deadEmoji : aliveEmoji}]`
        player.style.color = color
        score.appendChild(player)
    })
}

export const startTronGame = (data) => {
    nodes.gameField.innerHTML = ''

    deadEmoji = DEAD_EMOJIES[Math.floor(Math.random() * DEAD_EMOJIES.length)]
    aliveEmoji = ALIVE_EMOJIES[Math.floor(Math.random() * ALIVE_EMOJIES.length)]

    ownPlayerMeta = data.players.find(({ name }) => name === state.choosenName)

    field = document.createElement('div')
    field.classList.add('tronField')
    field.style.width = `${data.width + 2}px`
    field.style.height = `${data.height + 2}px`

    score = document.createElement('ul')

    tronCanvas = document.createElement('canvas')
    tronCanvas.width = data.width
    tronCanvas.height = data.height
    tronCanvas.classList.add('tronCanvas')
    canvasContext = tronCanvas.getContext('2d')
    canvasContext.lineWidth = 1

    upButton = createButton('⬆')
    leftButton = createButton('⬅')
    downButton = createButton('⬇')
    rightButton = createButton('➡')

    upButton.addEventListener('click', upHandler)
    leftButton.addEventListener('click', leftHandler)
    downButton.addEventListener('click', downHandler)
    rightButton.addEventListener('click', rightHandler)

    controls = document.createElement('div')
    controls.classList.add('tronControls')
    upButton.classList.add('tronUp')
    leftButton.classList.add('tronLeft')
    downButton.classList.add('tronDown')
    rightButton.classList.add('tronRight')
    controls.appendChild(upButton)
    controls.appendChild(leftButton)
    controls.appendChild(downButton)
    controls.appendChild(rightButton)

    field.appendChild(tronCanvas)
    nodes.gameField.appendChild(field)
    nodes.gameField.appendChild(controls)
    nodes.gameField.appendChild(score)

    showGameField()
}

export const tickTronGame = (data) => {
    if (!ownPlayerMeta) {
        startTronGame(data)
    }

    if (data.players.find(({ name }) => name === state.choosenName).dead) {
        upButton.disabled = true
        leftButton.disabled = true
        downButton.disabled = true
        rightButton.disabled = true
    }

    redrawField(data)
}

export const stopTronGame = () => {
    const closeBtn = document.createElement('button')
    closeBtn.type = 'button'
    closeBtn.innerHTML = 'Close'
    closeBtn.classList.add('userBtn')
    closeBtn.classList.add('closeBtn')

    closeBtn.addEventListener('click', () => {
        nodes.gameField.innerHTML = ''

        hideGameField()

        state.sendDataUpdate({
            type: 'game',
            name: 'tron',
            action: 'stop',
        })
    })

    nodes.gameField.appendChild(closeBtn)
}
