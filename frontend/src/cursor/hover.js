import { state } from '../state'
import {
    isPointer,
    isRectElement,
    isLineElement,
    isRowElement,
    isBoxElement,
} from '../utils/types'
import {
    isCursorNearPoint,
    isCursorNearBox,
    isCursorInBox,
    isCursorNearLine,
} from '../utils/intersection'
import {
    createControlPoints,
    shiftPoint,
} from '../utils/points'
import { getCoordinates } from '../utils/coords'
import { distanceToLine } from '../utils/distance'

const findCursoredElement = (cursor, elements = []) => elements
    .find((element) => isCursorInBox([
        shiftPoint(element.borders[0], -8),
        shiftPoint(element.borders[1], 8),
    ], cursor))

const findCursoredControlPoint = (cursor, borders) => createControlPoints(borders)
    .find((controlPoint) => isCursorNearPoint(controlPoint, cursor, 16))

export const startTrackHover = (event) => {
    const cursorPoint = getCoordinates(event)

    state.sendDataUpdate({
        type: 'cursor',
        cursor: cursorPoint,
    })

    if (isPointer(state.selectedType)
        && !state.pointerCaptureCoordinates
        && !state.workInProgressElements.length) {
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
