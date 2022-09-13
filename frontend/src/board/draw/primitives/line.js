export const line = (points, {
    strokeColor,
    strokeWidth = 1,
    context,
} = {}) => {
    context.strokeStyle = strokeColor
    context.strokeWidth = strokeWidth

    context.beginPath()
    context.moveTo(points[0][0], points[0][1])
    points.forEach((point) => {
        context.lineTo(point[0], point[1])
    })
    context.stroke()

    context.restore()
    context.save()
}
