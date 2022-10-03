import { state } from '../../data/state'
import { nodes } from '../../data/nodes'
import { getCoordinates } from '../../utils/coords'
import { redrawScreen } from '../draw'
import { DATA_ACTIONS } from '../../data/constants'

export const trackResizeElements = (event) => {
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

export const stopResizeElements = () => {
    state.sendDataUpdate({
        ...state.cursorSelectedElements[0],
        action: DATA_ACTIONS.resize,
    })

    state.pointerCaptureCoordinates = null
    state.cursorSelectedControlPoint = null
    state.cursorFixedControlPoint = null
    state.workInProgressElements = []

    nodes.canvas.removeEventListener('mousemove', trackResizeElements)
    nodes.canvas.removeEventListener('mouseup', stopResizeElements)
    nodes.canvas.removeEventListener('touchmove', trackResizeElements)
    nodes.canvas.removeEventListener('touchend', stopResizeElements)
}
