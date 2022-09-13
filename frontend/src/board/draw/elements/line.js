import { state } from '../../../data/state'
import { line } from '../primitives/line'

export const drawLine = (points, color) => {
    line(points, { context: state.canvasContext, strokeColor: color })
}
