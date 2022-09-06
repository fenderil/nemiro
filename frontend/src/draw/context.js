import { state } from '../state'

export const withContext = (fn) => (...args) => {
    const reservedFillColor = state.canvasContext.fillStyle
    const reservedStrokeColor = state.canvasContext.strokeStyle

    fn(...args)

    state.canvasContext.fillStyle = reservedFillColor
    state.canvasContext.strokeColor = reservedStrokeColor
}
