import { state } from '../../data/state'
import {
    isPointer,
    isRectElement,
    isLineElement,
    isRowElement,
    isBoxElement,
} from '../../utils/types'
import {
    isCursorNearBox,
    isCursorInBox,
    isCursorNearLine,
} from '../../utils/intersection'
import { getCoordinates } from '../../utils/coords'
import { distanceToLine } from '../../utils/distance'
import { redrawScreen } from '../draw'

// TODO: remove double code
export const startTrackClick = (event) => {
    const cursorPoint = getCoordinates(event)
    if (isPointer(state.selectedType)
        && !state.pointerCaptureCoordinates
        && !state.workInProgressElements.length
        && !state.cursorSelectedControlPoint) {
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
