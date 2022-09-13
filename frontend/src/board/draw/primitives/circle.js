export const circle = (center, radius, {
    strokeColor,
    fillColor,
    context,
    strokeWidth = 1,
}) => {
    context.fillStyle = fillColor
    context.strokeStyle = strokeColor
    context.strokeWidth = strokeWidth

    context.beginPath()
    context.arc(center[0], center[1], radius, 0, 2 * Math.PI, false)

    if (fillColor) {
        context.fill()
    }
    if (strokeColor) {
        context.stroke()
    }

    context.restore()
    context.save()
}
