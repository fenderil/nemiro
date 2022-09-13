import { text } from '../primitives/text'
import { state } from '../../../data/state'

export const drawText = (points, string, color, maxWidth = Infinity) => {
    text(points, string, {
        fillColor: color,
        maxWidth,
        context: state.canvasContext,
    })
}
