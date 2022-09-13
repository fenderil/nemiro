import { STRING_HEIGHT } from '../../../data/constants'
import { createMultilineText } from '../../../utils/text'

export const text = (points, string, {
    fillColor,
    font = '32px Tahoma',
    maxWidth = Infinity,
    context,
}) => {
    context.font = font
    const lines = createMultilineText(string, maxWidth).split(/[\r\n]/)

    context.fillStyle = fillColor
    lines.forEach((row, i) => {
        context.fillText(row, points[0][0], points[0][1] + 2 + i * STRING_HEIGHT)
    })

    context.restore()
    context.save()
}
