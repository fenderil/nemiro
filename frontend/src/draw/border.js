import { sortRectCoords } from '../utils/points'

import { drawRect } from './rect'
import { drawSticker } from './sticker'

export const drawBorder = (unsortedPoints, color, label) => {
    const [[x1, y1], [x2, y2]] = sortRectCoords(unsortedPoints)
    drawRect([
        [x1 - 4, y1 - 4],
        [x2 + 4, y2 + 4],
    ], color)

    if (label) {
        drawSticker([[x1, y1 - 24]], label, color)
    }
}
