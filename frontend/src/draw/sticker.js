import { createMultilineText, getStringWidth } from '../utils/text'
import { luma } from '../utils/color'
import { shiftPointForward8, shiftPointBack4, shiftPointForward4 } from '../utils/points'
import { MAX_STICKER_WIDTH, STRING_HEIGHT } from '../constants'

import { roundRect } from './rect'
import { drawText } from './text'

export const drawSticker = ([startPoint], text, color) => {
    const lines = createMultilineText(text, MAX_STICKER_WIDTH).split(/[\r\n]/)
    const linesWidth = lines.map(getStringWidth)
    const maxLineWidth = Math.max(...linesWidth)

    const edgePoint = [
        startPoint[0] + Math.min(maxLineWidth, MAX_STICKER_WIDTH),
        startPoint[1] + lines.length * STRING_HEIGHT,
    ]

    roundRect([
        startPoint,
        shiftPointForward8(edgePoint),
    ], { fillColor: '#555555' })
    roundRect([
        shiftPointBack4(startPoint),
        shiftPointForward4(edgePoint),
    ], { fillColor: color })
    drawText(
        [startPoint],
        text,
        luma(color) >= 165 ? '#000000' : '#ffffff',
    )
}
