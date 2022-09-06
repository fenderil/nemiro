import { state } from '../state'
import { sortRectCoords } from '../utils/points'

import { withContext } from './context'

export const roundRect = withContext((unsortedPoints, {
    radius = 5,
    strokeColor,
    fillColor,
} = {}) => {
    const points = sortRectCoords(unsortedPoints)

    state.canvasContext.fillStyle = fillColor
    state.canvasContext.strokeStyle = strokeColor

    const minRadiusX = Math.min(radius, (points[1][0] - points[0][0]) / 2)
    const minRadiusY = Math.min(radius, (points[1][1] - points[0][1]) / 2)

    state.canvasContext.beginPath()
    state.canvasContext.moveTo(points[0][0] + minRadiusX, points[0][1])
    state.canvasContext.lineTo(points[1][0] - minRadiusX, points[0][1])
    state.canvasContext.quadraticCurveTo(
        points[1][0],
        points[0][1],
        points[1][0],
        points[0][1] + minRadiusY,
    )
    state.canvasContext.lineTo(points[1][0], points[1][1] - minRadiusY)
    state.canvasContext.quadraticCurveTo(
        points[1][0],
        points[1][1],
        points[1][0] - minRadiusX,
        points[1][1],
    )
    state.canvasContext.lineTo(points[0][0] + minRadiusX, points[1][1])
    state.canvasContext.quadraticCurveTo(
        points[0][0],
        points[1][1],
        points[0][0],
        points[1][1] - minRadiusY,
    )
    state.canvasContext.lineTo(points[0][0], points[0][1] + minRadiusY)
    state.canvasContext.quadraticCurveTo(
        points[0][0],
        points[0][1],
        points[0][0] + minRadiusX,
        points[0][1],
    )
    state.canvasContext.closePath()

    if (fillColor) {
        state.canvasContext.fill()
    }
    if (strokeColor) {
        state.canvasContext.stroke()
    }
})

export const drawRect = (points, color) => {
    roundRect(points, { strokeColor: color, radius: 10 })
}
