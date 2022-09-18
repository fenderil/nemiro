import { createMultilineText, getStringWidth } from '../../../utils/text'
import { darker, luma } from '../../../utils/color'
import { shiftPoint } from '../../../utils/points'
import { MAX_STICKER_WIDTH, STRING_HEIGHT, STICKER_OFFSET } from '../../../data/constants'
import { state } from '../../../data/state'
import { rect } from '../primitives/rect'
import { text } from '../primitives/text'

export const drawSticker = ([startPoint], string, color) => {
    const lines = createMultilineText(string, MAX_STICKER_WIDTH).split(/[\r\n]/)
    const linesWidth = lines.map(getStringWidth)
    const maxLineWidth = Math.max(...linesWidth)

    const edgePoint = [
        startPoint[0] + Math.min(maxLineWidth, MAX_STICKER_WIDTH) + 2 * STICKER_OFFSET,
        startPoint[1] + lines.length * STRING_HEIGHT + 2 * STICKER_OFFSET,
    ]

    rect([
        startPoint,
        edgePoint,
    ], {
        context: state.canvasContext,
        fillColor: color,
        strokeColor: darker(color),
        lineWidth: 1,
        radius: 4,
        shadow: true,
    })

    text(
        [shiftPoint(startPoint, STICKER_OFFSET)],
        string,
        {
            context: state.canvasContext,
            fillColor: luma(color) >= 165 ? '#000000' : '#ffffff',
            maxWidth: MAX_STICKER_WIDTH,
        },
    )
}
