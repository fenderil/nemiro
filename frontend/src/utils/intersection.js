import { distanceToLine } from './distance'
import { sortRectCoords } from './points'

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

export const isCursorNearPoint = (point, cursor, distance) => {
    const xPow = (point[0] - cursor[0]) ** 2
    const yPow = (point[1] - cursor[1]) ** 2
    return xPow + yPow <= distance ** 2
}

export const isCursorNearLine = (points, cursor) => {
    for (let pointIndex = 0; pointIndex < points.length; pointIndex += 1) {
        if (isCursorNearPoint(points[pointIndex], cursor, 8)) {
            return true
        }
    }

    return false
}
