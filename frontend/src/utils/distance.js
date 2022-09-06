const scalar = (aX, aY, bX, bY, cX, cY) => (cX - aX) * (bX - aX) + (cY - aY) * (bY - aY)
const area = (a, b, c) => {
    const p = (a + b + c) / 2
    return Math.sqrt(p * (p - a) * (p - b) * (p - c))
}

export const distanceAB = (aX, aY, bX, bY) => {
    const dX = aX - bX
    const dY = aY - bY
    return Math.sqrt((dX ** 2) + (dY ** 2))
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
