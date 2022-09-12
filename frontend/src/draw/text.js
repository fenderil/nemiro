import { STRING_HEIGHT } from '../constants'
import { state } from '../state'
import { createMultilineText } from '../utils/text'

import { withContext } from './context'

export const drawText = withContext((points, text, color, maxWidth = Infinity) => {
    const lines = createMultilineText(text, maxWidth).split(/[\r\n]/)

    state.canvasContext.fillStyle = color
    lines.forEach((row, i) => {
        state.canvasContext.fillText(row, points[0][0], points[0][1] + 2 + i * STRING_HEIGHT)
    })
})
