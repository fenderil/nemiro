import { state } from '../state'

import { withContext } from './context'

export const drawLine = withContext((points, color) => {
    state.canvasContext.strokeStyle = color

    state.canvasContext.beginPath()
    state.canvasContext.moveTo(points[0][0], points[0][1])
    points.forEach((point) => {
        state.canvasContext.lineTo(point[0], point[1])
    })
    state.canvasContext.stroke()
})
