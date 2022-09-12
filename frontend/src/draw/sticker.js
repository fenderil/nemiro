import { createMultilineText, getStringWidth } from '../utils/text'
import { luma } from '../utils/color'
import { shiftPoint } from '../utils/points'
import { MAX_STICKER_WIDTH, STRING_HEIGHT } from '../constants'
import { state } from '../state'

import { roundRect } from './rect'
import { drawText } from './text'
import { withContext } from './context'

export const drawSticker = ([startPoint], text, color, radius = 2, offset = 8, shadow = true) => {
    const lines = createMultilineText(text, MAX_STICKER_WIDTH).split(/[\r\n]/)
    const linesWidth = lines.map(getStringWidth)
    const maxLineWidth = Math.max(...linesWidth)

    const edgePoint = [
        startPoint[0] + Math.min(maxLineWidth, MAX_STICKER_WIDTH),
        startPoint[1] + lines.length * STRING_HEIGHT,
    ]

    withContext(() => {
        if (shadow) {
            state.canvasContext.shadowColor = 'rgba(0,0,0,0.5)'
            state.canvasContext.shadowBlur = 10
            state.canvasContext.shadowOffsetY = 6
        }

        roundRect([
            shiftPoint(startPoint, -offset),
            shiftPoint(edgePoint, offset),
        ], { fillColor: color, radius })
    })()
    drawText(
        [startPoint],
        text,
        luma(color) >= 165 ? '#000000' : '#ffffff',
        MAX_STICKER_WIDTH,
    )
}
