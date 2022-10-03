import { state } from '../../data/state'
import { nodes } from '../../data/nodes'
import { getCoordinatesOnWindow } from '../../utils/coords'

export const trackMoveCanvas = (event) => {
    const nextPoint = getCoordinatesOnWindow(event, 1)
    const nextScrollLeft = Math.floor(state.pointerCaptureCoordinates[0] - nextPoint[0])
    const nextScrollTop = Math.floor(state.pointerCaptureCoordinates[1] - nextPoint[1])
    nodes.board.scrollLeft = nextScrollLeft < 0 ? 0 : nextScrollLeft
    nodes.board.scrollTop = nextScrollTop < 0 ? 0 : nextScrollTop
}

export const stopMoveCanvas = () => {
    state.pointerCaptureCoordinates = null

    nodes.canvas.removeEventListener('mousemove', trackMoveCanvas)
    nodes.canvas.removeEventListener('mouseup', stopMoveCanvas)
    nodes.canvas.removeEventListener('touchmove', trackMoveCanvas)
    nodes.canvas.removeEventListener('touchend', stopMoveCanvas)
}
