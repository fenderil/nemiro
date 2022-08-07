const getCookie = (name) => {
    let matches = document.cookie.match(new RegExp(
        "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
    ));
    return matches ? decodeURIComponent(matches[1]) : undefined;
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

const splitOnRows = (text, maxWidth = MAX_STICKER_WIDTH) => {
    const collection = ['']
    let part = 0

    text.split('').forEach((symbol) => {
        const { width } = canvasContext.measureText(collection[part] + symbol)

        if (symbol === '\n') {
            part += 1
            collection[part] = ''
        } else if (width <= maxWidth) {
            collection[part] = collection[part] + symbol
        } else {
            part += 1
            collection[part] = symbol
        }
    })

    return collection
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
const distanceToLine = (aX, aY, bX, bY, x, y) => {
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
