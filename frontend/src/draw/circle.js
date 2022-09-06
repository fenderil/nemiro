import { state } from '../state'

import { withContext } from './context'

export const drawCircle = withContext((center, radius, {
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
})
