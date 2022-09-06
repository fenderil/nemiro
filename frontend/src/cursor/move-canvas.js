import { state } from '../state'
import { nodes } from '../nodes'
import { getCoordinatesOnWindow } from '../utils/coords'

export const trackMoveCanvas = (event) => {
    const nextPoint = getCoordinatesOnWindow(event, 1)
    const nextScrollLeft = Math.floor(state.pointerCaptureCoordinates[0] - nextPoint[0])
    const nextScrollTop = Math.floor(state.pointerCaptureCoordinates[1] - nextPoint[1])
    nodes.canvasRoot.parentNode.scrollLeft = nextScrollLeft < 0 ? 0 : nextScrollLeft
    nodes.canvasRoot.parentNode.scrollTop = nextScrollTop < 0 ? 0 : nextScrollTop
}

export const stopMoveCanvas = () => {
    state.pointerCaptureCoordinates = null

    nodes.canvasRoot.removeEventListener('mousemove', trackMoveCanvas)
    nodes.canvasRoot.removeEventListener('mouseup', stopMoveCanvas)
    nodes.canvasRoot.removeEventListener('touchmove', trackMoveCanvas)
    nodes.canvasRoot.removeEventListener('touchend', stopMoveCanvas)
}
