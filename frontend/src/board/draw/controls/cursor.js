import { state } from '../../../data/state'
import { line } from '../primitives/line'
import { text } from '../primitives/text'

const createCursorPoints = ([x, y]) => [
    [x, y],
    [x + 6, y + 16],
    [x + 8, y + 8],
    [x + 16, y + 6],
    [x, y],
]

export const drawCursor = (point, userName) => {
    line(createCursorPoints(point), { strokeColor: '#63DB93', context: state.canvasContext })
    text([[point[0], point[1] - 20]], userName, { fillColor: '#63DB93' })
}
