import { sortRectCoords } from '../../../utils/points'

export const rect = (unsortedPoints, {
    radius = 0,
    strokeColor,
    lineWidth = 2,
    fillColor,
    context,
    shadow,
} = {}) => {
    const points = sortRectCoords(unsortedPoints)

    context.fillStyle = fillColor
    context.strokeStyle = strokeColor
    context.lineWidth = lineWidth

    if (shadow) {
        context.shadowColor = 'rgba(0,0,0,0.5)'
        context.shadowBlur = 10
        context.shadowOffsetY = 6
    }

    const minRadiusX = Math.min(radius, (points[1][0] - points[0][0]) / 2)
    const minRadiusY = Math.min(radius, (points[1][1] - points[0][1]) / 2)

    context.beginPath()
    context.moveTo(points[0][0] + minRadiusX, points[0][1])
    context.lineTo(points[1][0] - minRadiusX, points[0][1])
    context.quadraticCurveTo(
        points[1][0],
        points[0][1],
        points[1][0],
        points[0][1] + minRadiusY,
    )
    context.lineTo(points[1][0], points[1][1] - minRadiusY)
    context.quadraticCurveTo(
        points[1][0],
        points[1][1],
        points[1][0] - minRadiusX,
        points[1][1],
    )
    context.lineTo(points[0][0] + minRadiusX, points[1][1])
    context.quadraticCurveTo(
        points[0][0],
        points[1][1],
        points[0][0],
        points[1][1] - minRadiusY,
    )
    context.lineTo(points[0][0], points[0][1] + minRadiusY)
    context.quadraticCurveTo(
        points[0][0],
        points[0][1],
        points[0][0] + minRadiusX,
        points[0][1],
    )
    context.closePath()

    if (fillColor) {
        context.fill()
    }
    if (strokeColor) {
        context.stroke()
    }

    context.restore()
    context.save()
}
