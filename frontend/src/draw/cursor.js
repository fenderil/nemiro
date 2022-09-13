import { drawLine } from './line'

const createCursorPoints = ([x, y]) => [
    [x, y],
    [x + 6, y + 16],
    [x + 8, y + 8],
    [x + 16, y + 6],
    [x, y],
]

export const drawCursor = ([x, y], color) => {
    drawLine(createCursorPoints([x, y]), color)
}
