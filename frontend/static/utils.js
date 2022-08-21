const getCookie = (name) => {
    let matches = document.cookie.match(new RegExp(
        "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
    ));
    return matches ? decodeURIComponent(matches[1]) : undefined;
}

const getCoordinatesOnWindow = (event) => {
    if (event.pageX || event.pageY) {
        return [
            event.pageX,
            event.pageY
        ]
    } else if (event.touches) {
        return [
            event.touches[0].pageX,
            event.touches[0].pageY
        ]
    }

    return [0, 0]
}
const getCoordinates = (event) => {
    if (event.pageX || event.pageY) {
        return [
            Math.floor(canvasRoot.parentNode.scrollLeft) + event.pageX,
            Math.floor(canvasRoot.parentNode.scrollTop) + event.pageY
        ]
    } else if (event.touches) {
        return [
            Math.floor(canvasRoot.parentNode.scrollLeft) + event.touches[0].pageX,
            Math.floor(canvasRoot.parentNode.scrollTop) + event.touches[0].pageY
        ]
    }

    return [0, 0]
}

const insertSymbol = (string, index, replacement) =>
    `${string.substring(0, index)}${replacement}${string.substring(index)}`

const createMultilineText = (text, maxWidth = MAX_STICKER_WIDTH) => {
    let tempText = ''

    text.split('').forEach((symbol) => {
        tempText += symbol
        const lines = tempText.split(/[\r\n]/)
        const lastLine = lines[lines.length - 1]
        const { width: lastLineWidth } = canvasContext.measureText(lastLine)

        if (lastLineWidth > maxWidth) {
            if (lastLine.includes(' ')) {
                tempText = insertSymbol(tempText, tempText.lastIndexOf(' ') + 1, '\r')
            } else {
                tempText = insertSymbol(tempText, tempText.length - 1, '\r')
            }
        }
    })

    return tempText
}

const distanceAB = (aX, aY, bX, bY) => {
    const dX = aX - bX
    const dY = aY - bY
    return Math.sqrt(dX * dX + dY * dY)
}
const scalar = (aX, aY, bX, bY, cX, cY) => (cX - aX) * (bX - aX) + (cY - aY) * (bY - aY)
const area = (a, b, c) => {
    const p = (a + b + c) / 2
    return Math.sqrt(p * (p - a) * (p - b) * (p - c))
}
const distanceToLine = ([[aX, aY], [bX, bY]], [x, y]) => {
    const dAX = distanceAB(aX, aY, x, y)
    if (dAX == 0) {
        return 0
    }
    const dBX = distanceAB(bX, bY, x, y)
    if (dBX == 0) {
        return 0
    }

    const dAB = distanceAB(aX, aY, bX, bY)
    if (dAB == 0) {
        return dAX
    }
    if (scalar(aX, aY, bX, bY, x, y) <= 0) {
        return dAX
    }
    if (scalar(bX, bY, aX, aY, x, y) <= 0) {
        return dBX
    }
    return area(dAB, dAX, dBX) * 2 / dAB
}

const sortRectCoords = ([[x0, y0], [x1, y1]]) => 
    [[Math.min(x0, x1), Math.min(y0, y1)], [Math.max(x0, x1), Math.max(y0, y1)]]
