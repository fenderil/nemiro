import { state } from '../../../data/state'
import { rect } from '../primitives/rect'

export const drawRect = (points, color) => {
    rect(points, { context: state.canvasContext, strokeColor: color, radius: 16 })
}
