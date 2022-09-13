import { state } from '../state'
import { nodes } from '../nodes'
import {
    isRectElement,
    isLineElement,
    isRowElement,
    isImageElement,
    isStickerElement,
    isTextElement,
    isEditableElement,
} from '../utils/types'

import { drawRect } from './rect'
import { drawLine } from './line'
import { drawImage } from './image'
import { drawText } from './text'
import { drawSticker } from './sticker'
import { drawCursor } from './cursor'
import { drawBorder } from './border'
import { drawBorderPoints } from './border-points'

const drawElement = (element) => {
    if (isRectElement(element)) {
        drawRect(element.points, element.color)
    } else if (isLineElement(element) || isRowElement(element)) {
        drawLine(element.points, element.color)
    } else if (isImageElement(element)) {
        drawImage(element.points, element.url)
    } else if (isTextElement(element) && element.text) {
        drawText(element.points, element.text, element.color)
    } else if (isStickerElement(element) && element.text) {
        drawSticker(element.points, element.text, element.color)
    }
}

const clearCanvas = () => {
    state.canvasContext.restore()
    state.canvasContext.save()
    state.canvasContext.clearRect(
        0,
        0,
        nodes.canvasRoot.width,
        nodes.canvasRoot.height,
    )
}

export const redrawScreen = () => {
    clearCanvas()

    state.savedElements.forEach((element) => {
        if (!state.workInProgressElements.find(({ id }) => id === element.id)) {
            drawElement(element)
        }
    })

    state.savedUsers.forEach((user) => {
        if (user.cursor && user.online && state.choosenName !== user.name) {
            drawCursor(user.cursor, '#63DB93')
            drawText([[user.cursor[0], user.cursor[1] - 20]], user.name, '#63DB93')
        }
    })

    if (!state.workInProgressElements.length && state.cursorHoveredElements.length) {
        state.cursorHoveredElements
            .forEach((cursorHoveredElement) => {
                drawBorder(
                    cursorHoveredElement.borders || cursorHoveredElement.points,
                    '#f2c5c5',
                    cursorHoveredElement.author,
                )
            })
    }
    if (!state.workInProgressElements.length && state.cursorSelectedElements.length) {
        state.cursorSelectedElements
            .forEach((cursorSelectedElement) => {
                drawBorder(
                    cursorSelectedElement.borders || cursorSelectedElement.points,
                    '#d26565',
                )

                if (cursorSelectedElement.borders && !isEditableElement(cursorSelectedElement)) {
                    drawBorderPoints(cursorSelectedElement.borders)
                }
            })
    }
    if (state.selectionFramePoints) {
        drawBorder(state.selectionFramePoints, '#65d265', 'Selection frame')
    }

    if (state.workInProgressElements.length) {
        state.workInProgressElements
            .forEach((element) => {
                drawElement(element)
            })
    }
}
