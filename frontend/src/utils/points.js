export const shiftPoint = (point, px) => point.map((d) => d + px)

export const sortRectCoords = ([[x0, y0], [x1, y1]]) => [
    [Math.min(x0, x1), Math.min(y0, y1)],
    [Math.max(x0, x1), Math.max(y0, y1)],
]

export const createControlPoints = (borders) => [
    [borders[0][0], borders[0][1]],
    [borders[1][0], borders[0][1]],
    [borders[1][0], borders[1][1]],
    [borders[0][0], borders[1][1]],
]

export const isPointsEqual = ([x0, y0], [x1, y1]) => x0 === x1 && y0 === y1
