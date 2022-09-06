import { state } from '../state'
import { nodes } from '../nodes'
import { sortRectCoords } from '../utils/points'
import { getCoordinates } from '../utils/coords'

export const trackSelectFrame = (event) => {
    state.selectionFramePoints = sortRectCoords([
        state.pointerCaptureCoordinates,
        getCoordinates(event),
    ])

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

export const stopSelectFrame = () => {
    nodes.canvasRoot.removeEventListener('mousemove', trackSelectFrame)
    nodes.canvasRoot.removeEventListener('mouseup', stopSelectFrame)

    state.selectionFramePoints = null
    state.pointerCaptureCoordinates = null
}
