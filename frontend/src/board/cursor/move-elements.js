import { state } from '../../data/state'
import { nodes } from '../../data/nodes'
import { getCoordinates } from '../../utils/coords'
import { redrawScreen } from '../draw'
import { DATA_ACTIONS } from '../../data/constants'

export const trackMoveElements = (event) => {
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

export const stopMoveElements = () => {
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
