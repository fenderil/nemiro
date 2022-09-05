import { state, nodes } from './state'
import {
    isCursorInBox,
    sizeUpBorders,
    createControlPoints,
    isCursorNearPoint,
    getCoordinates,
    getCoordinatesOnWindow,
    isPointer,
    sortRectCoords,
    isRectElement,
    isLineElement,
    isRowElement,
    isBoxElement,
    isCursorNearBox,
    distanceToLine,
    isCursorNearLine,
} from './utils'
import { redrawScreen } from './draw'
import { DATA_ACTIONS } from './constants'

const trackDoubleClick = () => {
    if (state.doubleClickTimeoutId) {
        clearTimeout(state.doubleClickTimeoutId)
        state.doubleClick = true
        state.doubleClickTimeoutId = null
    } else {
        state.doubleClickTimeoutId = setTimeout(() => {
            state.doubleClick = false
            state.doubleClickTimeoutId = null
        }, 300)
    }
}

const untrackDoubleClick = () => {
    state.doubleClick = false
}

export const withDoubleClick = (cb, is) => (event) => {
    if ((is && state.doubleClick) || (!is && !state.doubleClick)) {
        cb(event)
    }
}

nodes.canvasRoot.addEventListener('mousedown', trackDoubleClick)
nodes.canvasRoot.addEventListener('touchstart', trackDoubleClick)
nodes.canvasRoot.addEventListener('mouseup', untrackDoubleClick)
nodes.canvasRoot.addEventListener('touchend', untrackDoubleClick)

const findCursoredElement = (cursor, elements = []) => elements
    .find((element) => isCursorInBox(sizeUpBorders(element.borders, 8), cursor))

const findCursoredControlPoint = (cursor, borders) => createControlPoints(borders)
    .find((controlPoint) => isCursorNearPoint(controlPoint, cursor, 16))

export const startTrackCursor = (event) => {
    const cursorPoint = getCoordinates(event)

    state.sendDataUpdate({
        type: 'cursor',
        cursor: cursorPoint,
    })

    if (isPointer(state.selectedType) && !state.pointerCaptureCoordinates && !state.workInProgressElements.length) {
        const cursoredElement = findCursoredElement(cursorPoint, state.cursorSelectedElements)

        state.cursorSelectedControlPoint = cursoredElement && cursoredElement.borders
            ? findCursoredControlPoint(cursorPoint, cursoredElement.borders) || null
            : null

        state.cursorHoveredElements = []

        for (let i = state.savedElements.length - 1; i >= 0; i -= 1) {
            const element = state.savedElements[i]

            if ((isBoxElement(element) && isCursorInBox(element.points, cursorPoint))
                || (isRectElement(element) && isCursorNearBox(element.points, cursorPoint))
                || (isRowElement(element) && distanceToLine(element.points, cursorPoint) < 8)
                || (isLineElement(element) && isCursorNearLine(element.points, cursorPoint))) {
                state.cursorHoveredElements = [element]
                break
            }
        }
    }
}

// TODO: remove double code
export const startTrackClick = (event) => {
    const cursorPoint = getCoordinates(event)
    if (isPointer(state.selectedType) && !state.pointerCaptureCoordinates && !state.workInProgressElements.length && !state.cursorSelectedControlPoint) {
        let foundElement = false
        for (let i = state.savedElements.length - 1; i >= 0; i -= 1) {
            const element = state.savedElements[i]

            if ((isBoxElement(element) && isCursorInBox(element.points, cursorPoint))
                || (isRectElement(element) && isCursorNearBox(element.points, cursorPoint))
                || (isRowElement(element) && distanceToLine(element.points, cursorPoint) < 8)
                || (isLineElement(element) && isCursorNearLine(element.points, cursorPoint))) {
                if (event.ctrlKey) {
                    // TODO: only unique
                    state.cursorSelectedElements.push(element)
                } else {
                    state.cursorSelectedElements = [element]
                }

                foundElement = true
                break
            }

            if (!event.ctrlKey && !foundElement) {
                state.cursorSelectedElements = []
            }
        }
    }

    redrawScreen()
}

const trackMoveElements = (event) => {
    const nextCoordinates = getCoordinates(event)

    const diffX = state.pointerCaptureCoordinates[0] - nextCoordinates[0]
    const diffY = state.pointerCaptureCoordinates[1] - nextCoordinates[1]

    state.pointerCaptureCoordinates = nextCoordinates

    // TODO: use workInProgressElements?
    state.cursorSelectedElements.forEach((movingElement) => {
        movingElement.points = movingElement.points.map((point) => [point[0] - diffX, point[1] - diffY])
        movingElement.borders = movingElement.borders.map((point) => [point[0] - diffX, point[1] - diffY])
    })

    redrawScreen()
}

const stopMoveElements = () => {
    if (state.cursorSelectedElements.length) {
        state.cursorSelectedElements.forEach((movingElement) => {
            state.sendDataUpdate({
                ...movingElement,
                action: DATA_ACTIONS.move,
            })
        })
    }

    state.pointerCaptureCoordinates = null

    nodes.canvasRoot.removeEventListener('mousemove', trackMoveElements)
    nodes.canvasRoot.removeEventListener('mouseup', stopMoveElements)
    nodes.canvasRoot.removeEventListener('touchmove', trackMoveElements)
    nodes.canvasRoot.removeEventListener('touchend', stopMoveElements)
}

const trackResizeElements = (event) => {
    const nextCoordinates = getCoordinates(event)

    if (!state.cursorFixedControlPoint) {
        const { borders } = state.cursorSelectedElements[0]
        state.workInProgressElements[0] = state.cursorSelectedElements[0]
        state.cursorFixedControlPoint = [
            borders[0][0] === state.cursorSelectedControlPoint[0] ? borders[1][0] : borders[0][0],
            borders[0][1] === state.cursorSelectedControlPoint[1] ? borders[1][1] : borders[0][1],
        ]
    }

    const deltaX = state.cursorFixedControlPoint[0] - state.pointerCaptureCoordinates[0]
    const deltaY = state.cursorFixedControlPoint[1] - state.pointerCaptureCoordinates[1]

    // TODO: use workInProgressElements?
    if (deltaX !== 0 && deltaY !== 0) {
        const scaleX = (state.cursorFixedControlPoint[0] - nextCoordinates[0]) / deltaX
        const scaleY = (state.cursorFixedControlPoint[1] - nextCoordinates[1]) / deltaY

        if (scaleX !== 0 && scaleY !== 0) {
            state.pointerCaptureCoordinates = nextCoordinates

            state.cursorSelectedElements[0].points = state.cursorSelectedElements[0].points.map((point) => [
                state.cursorFixedControlPoint[0] + (point[0] - state.cursorFixedControlPoint[0]) * scaleX,
                state.cursorFixedControlPoint[1] + (point[1] - state.cursorFixedControlPoint[1]) * scaleY,
            ])
            state.cursorSelectedElements[0].borders = state.cursorSelectedElements[0].borders.map((point) => [
                state.cursorFixedControlPoint[0] + (point[0] - state.cursorFixedControlPoint[0]) * scaleX,
                state.cursorFixedControlPoint[1] + (point[1] - state.cursorFixedControlPoint[1]) * scaleY,
            ])

            redrawScreen()
        }
    }
}

const stopResizeElements = () => {
    state.sendDataUpdate({
        ...state.cursorSelectedElements[0],
        action: DATA_ACTIONS.resize,
    })

    state.pointerCaptureCoordinates = null
    state.cursorSelectedControlPoint = null
    state.cursorFixedControlPoint = null
    state.workInProgressElements = []

    nodes.canvasRoot.removeEventListener('mousemove', trackResizeElements)
    nodes.canvasRoot.removeEventListener('mouseup', stopResizeElements)
    nodes.canvasRoot.removeEventListener('touchmove', trackResizeElements)
    nodes.canvasRoot.removeEventListener('touchend', stopResizeElements)
}

const trackMoveCanvas = (event) => {
    const nextPoint = getCoordinatesOnWindow(event, 1)
    const nextScrollLeft = Math.floor(state.pointerCaptureCoordinates[0] - nextPoint[0])
    const nextScrollTop = Math.floor(state.pointerCaptureCoordinates[1] - nextPoint[1])
    nodes.canvasRoot.parentNode.scrollLeft = nextScrollLeft < 0 ? 0 : nextScrollLeft
    nodes.canvasRoot.parentNode.scrollTop = nextScrollTop < 0 ? 0 : nextScrollTop
}

const stopMoveCanvas = () => {
    state.pointerCaptureCoordinates = null

    nodes.canvasRoot.removeEventListener('mousemove', trackMoveCanvas)
    nodes.canvasRoot.removeEventListener('mouseup', stopMoveCanvas)
    nodes.canvasRoot.removeEventListener('touchmove', trackMoveCanvas)
    nodes.canvasRoot.removeEventListener('touchend', stopMoveCanvas)
}

const trackSelectFrame = (event) => {
    state.selectionFramePoints = sortRectCoords([state.pointerCaptureCoordinates, getCoordinates(event)])

    state.cursorSelectedElements = []

    for (let i = state.savedElements.length - 1; i >= 0; i -= 1) {
        const element = state.savedElements[i]

        if (element.borders[0][0] > state.selectionFramePoints[0][0]
            && element.borders[0][1] > state.selectionFramePoints[0][1]
            && element.borders[1][0] < state.selectionFramePoints[1][0]
            && element.borders[1][1] < state.selectionFramePoints[1][1]) {
            state.cursorSelectedElements.push(element)
        }
    }
}

const stopSelectFrame = () => {
    nodes.canvasRoot.removeEventListener('mousemove', trackSelectFrame)
    nodes.canvasRoot.removeEventListener('mouseup', stopSelectFrame)

    state.selectionFramePoints = null
    state.pointerCaptureCoordinates = null
}

export const startMove = (event) => {
    if (isPointer(state.selectedType)) {
        if (state.cursorSelectedControlPoint) {
            state.pointerCaptureCoordinates = getCoordinates(event)
            nodes.canvasRoot.addEventListener('mousemove', trackResizeElements)
            nodes.canvasRoot.addEventListener('mouseup', stopResizeElements)
            nodes.canvasRoot.addEventListener('touchmove', trackResizeElements)
            nodes.canvasRoot.addEventListener('touchend', stopResizeElements)
        } else if (state.cursorSelectedElements.length) {
            state.pointerCaptureCoordinates = getCoordinates(event)
            nodes.canvasRoot.addEventListener('mousemove', trackMoveElements)
            nodes.canvasRoot.addEventListener('mouseup', stopMoveElements)
            nodes.canvasRoot.addEventListener('touchmove', trackMoveElements)
            nodes.canvasRoot.addEventListener('touchend', stopMoveElements)
        } else {
            state.pointerCaptureCoordinates = getCoordinates(event, 1, 1)
            nodes.canvasRoot.addEventListener('mousemove', trackMoveCanvas)
            nodes.canvasRoot.addEventListener('mouseup', stopMoveCanvas)
            nodes.canvasRoot.addEventListener('touchmove', trackMoveCanvas)
            nodes.canvasRoot.addEventListener('touchend', stopMoveCanvas)
        }
    }
}

export const startSelection = (event) => {
    if (isPointer(state.selectedType)) {
        state.pointerCaptureCoordinates = getCoordinates(event)
        nodes.canvasRoot.addEventListener('mousemove', trackSelectFrame)
        nodes.canvasRoot.addEventListener('mouseup', stopSelectFrame)
    }
}
