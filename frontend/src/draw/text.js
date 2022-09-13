import { STRING_HEIGHT } from '../constants'
import { state } from '../state'
import { createMultilineText } from '../utils/text'

export const drawText = (points, text, color, maxWidth = Infinity) => {
    const lines = createMultilineText(text, maxWidth).split(/[\r\n]/)

    state.canvasContext.fillStyle = color
    lines.forEach((row, i) => {
        state.canvasContext.fillText(row, points[0][0], points[0][1] + 2 + i * STRING_HEIGHT)
    })

    state.canvasContext.restore()
    state.canvasContext.save()
}
