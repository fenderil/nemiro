import {
    MAX_STICKER_WIDTH,
    nodes,
    state,
    canvasContext,
} from './state'

export const getCoordinatesOnWindow = (event, scale = state.currentScale) => {
    if (event.pageX || event.pageY) {
        return [
            event.pageX / scale,
            event.pageY / scale,
        ]
    } if (event.touches) {
        return [
            event.touches[0].pageX / scale,
            event.touches[0].pageY / scale,
        ]
    }

    return [0, 0]
}
export const getCoordinates = (event, scale = state.currentScale, htmlScale = state.currentScale) => {
    if (event.pageX || event.pageY) {
        return [
            Math.floor(nodes.canvasRoot.parentNode.scrollLeft) / htmlScale + event.pageX / scale,
            Math.floor(nodes.canvasRoot.parentNode.scrollTop) / htmlScale + event.pageY / scale,
        ]
    } if (event.touches) {
        return [
            Math.floor(nodes.canvasRoot.parentNode.scrollLeft) / htmlScale + event.touches[0].pageX / scale,
            Math.floor(nodes.canvasRoot.parentNode.scrollTop) / htmlScale + event.touches[0].pageY / scale,
        ]
    }

    return [0, 0]
}

export const insertSymbol = (string, index, replacement) => `${string.substring(0, index)}${replacement}${string.substring(index)}`
export const replaceSymbol = (string, index, replacement) => `${string.substring(0, index)}${replacement}${string.substring(index + 1)}`

export const createMultilineText = (text, maxWidth = MAX_STICKER_WIDTH) => {
    let tempText = ''

    text.split('').forEach((symbol) => {
        tempText += symbol
        const lines = tempText.split(/[\r\n]/)
        const lastLine = lines[lines.length - 1]
        const { width: lastLineWidth } = canvasContext.measureText(lastLine)

        if (lastLineWidth > maxWidth) {
            if (lastLine.includes(' ')) {
                // tempText = insertSymbol(tempText, tempText.lastIndexOf(' ') + 1, '\r')
                tempText = replaceSymbol(tempText, tempText.lastIndexOf(' '), '\r')
            } else {
                tempText = insertSymbol(tempText, tempText.length - 1, '\r')
            }
        }
    })

    return tempText
}

export const distanceAB = (aX, aY, bX, bY) => {
    const dX = aX - bX
    const dY = aY - bY
    return Math.sqrt((dX ** 2) + (dY ** 2))
}
export const scalar = (aX, aY, bX, bY, cX, cY) => (cX - aX) * (bX - aX) + (cY - aY) * (bY - aY)
export const area = (a, b, c) => {
    const p = (a + b + c) / 2
    return Math.sqrt(p * (p - a) * (p - b) * (p - c))
}
export const distanceToLine = ([[aX, aY], [bX, bY]], [x, y]) => {
    const dAX = distanceAB(aX, aY, x, y)
    if (dAX === 0) {
        return 0
    }
    const dBX = distanceAB(bX, bY, x, y)
    if (dBX === 0) {
        return 0
    }

    const dAB = distanceAB(aX, aY, bX, bY)
    if (dAB === 0) {
        return dAX
    }
    if (scalar(aX, aY, bX, bY, x, y) <= 0) {
        return dAX
    }
    if (scalar(bX, bY, aX, aY, x, y) <= 0) {
        return dBX
    }
    return (area(dAB, dAX, dBX) * 2) / dAB
}

export const sortRectCoords = ([[x0, y0], [x1, y1]]) => [[Math.min(x0, x1), Math.min(y0, y1)], [Math.max(x0, x1), Math.max(y0, y1)]]

export const hexToRGBArray = (color) => {
    color = color.toUpperCase()
    if (/^#[0-9A-F]{6}$/.test(color)) {
        const [, ...components] = color.match(/([0-9A-F]{2})([0-9A-F]{2})([0-9A-F]{2})/)
        return components.map((component) => parseInt(component, 16))
    } if (/^rgb\(([\d]{1,3}),([\d]{1,3}),([\d]{1,3})\)$/.test(color)) {
        const [, ...components] = color.match(/([\d]{1,3}),([\d]{1,3}),([\d]{1,3})/)
        return components.map((component) => parseInt(component, 16))
    }

    throw new Error(`${color} is not RGB like`)
}

export const luma = (color) => {
    const rgb = hexToRGBArray(color)
    return (0.2126 * rgb[0]) + (0.7152 * rgb[1]) + (0.0722 * rgb[2])
}

export const isCursorInBox = (points, cursor) => {
    const [[minX, minY], [maxX, maxY]] = sortRectCoords(points)

    return (
        minX <= cursor[0] && maxX >= cursor[0]
        && minY <= cursor[1] && maxY >= cursor[1]
    )
}

export const isCursorNearBox = (points, cursor) => {
    const [[minX, minY], [maxX, maxY]] = sortRectCoords(points)

    return (
        distanceToLine([[minX, minY], [maxX, minY]], cursor) <= 8
        || distanceToLine([[minX, minY], [minX, maxY]], cursor) <= 8
        || distanceToLine([[maxX, minY], [maxX, maxY]], cursor) <= 8
        || distanceToLine([[minX, maxY], [maxX, maxY]], cursor) <= 8
    )
}

export const isCursorNearPoint = (point, cursor, distance) => (point[0] - cursor[0]) ** 2 + (point[1] - cursor[1]) ** 2 <= distance ** 2

export const isCursorNearLine = (points, cursor) => {
    for (let pointIndex = 0; pointIndex < points.length; pointIndex += 1) {
        if (isCursorNearPoint(points[pointIndex], cursor, 8)) {
            return true
        }
    }

    return false
}

export const createControlPoints = (borders) => [
    [borders[0][0], borders[0][1]],
    [borders[1][0], borders[0][1]],
    [borders[1][0], borders[1][1]],
    [borders[0][0], borders[1][1]],
]

export const isPointsEqual = ([x0, y0], [x1, y1]) => x0 === x1 && y0 === y1

export const isPointer = (type) => type === 'pointer'

export const isImageElement = (element) => element.type === 'image'
export const isRectElement = (element) => element.type === 'rect'
export const isLineElement = (element) => element.type === 'line'
export const isRowElement = (element) => element.type === 'row'
export const isTextElement = (element) => element.type === 'text'
export const isStickerElement = (element) => element.type === 'sticker'

export const isEditableElement = (element) => isTextElement(element) || isStickerElement(element)
export const isBoxElement = (element) => isImageElement(element) || isEditableElement(element)
export const isDrawingElement = (element) => isImageElement(element) || isRectElement(element) || isLineElement(element) || isRowElement(element)

export const sizeUpBorders = (borders, diff) => [
    [borders[0][0] - diff, borders[0][1] - diff],
    [borders[1][0] + diff, borders[1][1] + diff],
]

export const clamp = (value, min, max) => Math.max(min, Math.min(max, value))
