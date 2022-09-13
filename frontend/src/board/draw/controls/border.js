import { state } from '../../../data/state'
import { shiftPoint, sortRectCoords } from '../../../utils/points'

import { rect } from '../primitives/rect'
import { text } from '../primitives/text'

export const drawBorder = (unsortedPoints, color, label) => {
    const [startPoint, edgePoint] = sortRectCoords(unsortedPoints)
    rect([
        shiftPoint(startPoint, -4),
        shiftPoint(edgePoint, 4),
    ], {
        strokeColor: color,
        context: state.canvasContext,
    })

    if (label) {
        text(
            [[startPoint[0] - 4, startPoint[1] - 30]],
            label,
            { fillColor: color, context: state.canvasContext },
        )
    }
}
