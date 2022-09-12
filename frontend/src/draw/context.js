import { state } from '../state'

export const withContext = (fn) => (...args) => {
    const reservedFillColor = state.canvasContext.fillStyle
    const reservedStrokeColor = state.canvasContext.strokeStyle
    const reservedShadowColor = state.canvasContext.shadowColor
    const reservedShadowBlur = state.canvasContext.shadowBlur
    const reservedShadowOffsetX = state.canvasContext.shadowOffsetX
    const reservedShadowOffsetY = state.canvasContext.shadowOffsetY

    fn(...args)

    state.canvasContext.fillStyle = reservedFillColor
    state.canvasContext.strokeColor = reservedStrokeColor
    state.canvasContext.shadowColor = reservedShadowColor
    state.canvasContext.shadowBlur = reservedShadowBlur
    state.canvasContext.shadowOffsetX = reservedShadowOffsetX
    state.canvasContext.shadowOffsetY = reservedShadowOffsetY
}
