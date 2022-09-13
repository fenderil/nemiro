import { state } from '../../data/state'

export const drawCircle = (center, radius, {
    strokeColor,
    fillColor,
}) => {
    state.canvasContext.fillStyle = fillColor
    state.canvasContext.strokeStyle = strokeColor

    state.canvasContext.beginPath()
    state.canvasContext.arc(center[0], center[1], radius, 0, 2 * Math.PI, false)

    if (fillColor) {
        state.canvasContext.fill()
    }
    if (strokeColor) {
        state.canvasContext.stroke()
    }

    state.canvasContext.restore()
    state.canvasContext.save()
}
