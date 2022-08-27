const trackDoubleClick = () => {
    if (doubleClickTimeoutId) {
        clearTimeout(doubleClickTimeoutId)
        doubleClick = true
        doubleClickTimeoutId = null
    } else {
        doubleClickTimeoutId = setTimeout(() => {
            doubleClick = false
            doubleClickTimeoutId = null
        }, 300)
    }
}

const untrackDoubleClick = () => {
    doubleClick = false
}

const withDoubleClick = (cb, is) => (event) => {
    if ((is && doubleClick) || (!is && !doubleClick)) {
        cb(event)
    }
}

canvas.addEventListener('mousedown', trackDoubleClick)
canvas.addEventListener('touchstart', trackDoubleClick)
canvas.addEventListener('mouseup', untrackDoubleClick)
canvas.addEventListener('touchend', untrackDoubleClick)

const findCursoredElement = (cursor, elements = []) => elements
    .find((element) => isCursorInBox(sizeUpBorders(element.borders, 8), cursor))

const findCursoredControlPoint = (cursor, borders) => createControlPoints(borders)
    .find((controlPoint) => isCursorNearPoint(controlPoint, cursor, 16))

const startTrackCursor = (event) => {
    const cursorPoint = getCoordinates(event)

    sendDataUpdate({
        type: 'cursor',
        cursor: cursorPoint,
    })

    if (isPointer(selectedType) && !pointerCaptureCoordinates && !workInProgressElement) {
        const cursoredElement = findCursoredElement(cursorPoint, cursorHoveredElements)

        cursorSelectedControlPoint = cursoredElement && cursoredElement.borders
            ? findCursoredControlPoint(cursorPoint, cursoredElement.borders) || null
            : null

        cursorHoveredElements = []

        for (let i = savedElements.length - 1; i >= 0; i -= 1) {
            const element = savedElements[i]

            if ((isBoxElement(element) && isCursorInBox(element.points, cursorPoint))
                || (isRectElement(element) && isCursorNearBox(element.points, cursorPoint))
                || (isRowElement(element) && distanceToLine(element.points, cursorPoint) < 8)
                || (isLineElement(element) && isCursorNearLine(element.points, cursorPoint))) {
                cursorHoveredElements = [element]
                break
            }
        }
    }
}

// TODO: remove double code
const startTrackClick = (event) => {
    const cursorPoint = getCoordinates(event)
    if (isPointer(selectedType) && !pointerCaptureCoordinates && !workInProgressElement) {
        let foundElement = false
        for (let i = savedElements.length - 1; i >= 0; i -= 1) {
            const element = savedElements[i]

            if ((isBoxElement(element) && isCursorInBox(element.points, cursorPoint))
                || (isRectElement(element) && isCursorNearBox(element.points, cursorPoint))
                || (isRowElement(element) && distanceToLine(element.points, cursorPoint) < 8)
                || (isLineElement(element) && isCursorNearLine(element.points, cursorPoint))) {
                if (event.ctrlKey) {
                    // TODO: only unique
                    cursorSelectedElements.push(element)
                } else {
                    cursorSelectedElements = [element]
                }

                foundElement = true
                break
            }

            if (!event.ctrlKey && !foundElement) {
                cursorSelectedElements = []
            }
        }
    }

    redrawScreen()
}

canvas.addEventListener('mousemove', startTrackCursor)
canvas.addEventListener('mousedown', withDoubleClick(startTrackClick, false))
canvas.addEventListener('touchstart', withDoubleClick(startTrackClick, false))

const trackMoveElements = (event) => {
    const nextCoordinates = getCoordinates(event)

    const diffX = pointerCaptureCoordinates[0] - nextCoordinates[0]
    const diffY = pointerCaptureCoordinates[1] - nextCoordinates[1]

    pointerCaptureCoordinates = nextCoordinates

    // TODO: use workInProgressElement?
    cursorSelectedElements.forEach((movingElement) => {
        movingElement.points = movingElement.points.map((point) => [point[0] - diffX, point[1] - diffY])
        movingElement.borders = movingElement.borders.map((point) => [point[0] - diffX, point[1] - diffY])
    })

    redrawScreen()
}

const stopMoveElements = () => {
    if (cursorSelectedElements.length) {
        cursorSelectedElements.forEach((movingElement) => {
            sendDataUpdate({
                ...movingElement,
                action: 'move',
            })
        })
    }

    pointerCaptureCoordinates = null

    canvas.removeEventListener('mousemove', trackMoveElements)
    canvas.removeEventListener('mouseup', stopMoveElements)
    canvas.removeEventListener('touchmove', trackMoveElements)
    canvas.removeEventListener('touchend', stopMoveElements)
}

const trackResizeElements = (event) => {
    const nextCoordinates = getCoordinates(event)

    if (!cursorFixedControlPoint) {
        const { borders } = cursorSelectedElements[0]
        cursorFixedControlPoint = [
            borders[0][0] === cursorSelectedControlPoint[0] ? borders[1][0] : borders[0][0],
            borders[0][1] === cursorSelectedControlPoint[1] ? borders[1][1] : borders[0][1],
        ]
    }

    const deltaX = cursorFixedControlPoint[0] - pointerCaptureCoordinates[0]
    const deltaY = cursorFixedControlPoint[1] - pointerCaptureCoordinates[1]

    // TODO: use workInProgressElement?
    if (deltaX !== 0 && deltaY !== 0) {
        const scaleX = (cursorFixedControlPoint[0] - nextCoordinates[0]) / deltaX
        const scaleY = (cursorFixedControlPoint[1] - nextCoordinates[1]) / deltaY

        if (scaleX !== 0 && scaleY !== 0) {
            pointerCaptureCoordinates = nextCoordinates

            cursorSelectedElements[0].points = cursorSelectedElements[0].points.map((point) => [
                cursorFixedControlPoint[0] + (point[0] - cursorFixedControlPoint[0]) * scaleX,
                cursorFixedControlPoint[1] + (point[1] - cursorFixedControlPoint[1]) * scaleY,
            ])
            cursorSelectedElements[0].borders = cursorSelectedElements[0].borders.map((point) => [
                cursorFixedControlPoint[0] + (point[0] - cursorFixedControlPoint[0]) * scaleX,
                cursorFixedControlPoint[1] + (point[1] - cursorFixedControlPoint[1]) * scaleY,
            ])

            redrawScreen()
        }
    }
}

const stopResizeElements = () => {
    sendDataUpdate({
        ...cursorSelectedElements[0],
        action: 'resize',
    })

    pointerCaptureCoordinates = null
    cursorSelectedControlPoint = null
    cursorFixedControlPoint = null

    canvas.removeEventListener('mousemove', trackResizeElements)
    canvas.removeEventListener('mouseup', stopResizeElements)
    canvas.removeEventListener('touchmove', trackResizeElements)
    canvas.removeEventListener('touchend', stopResizeElements)
}

const trackMoveCanvas = (event) => {
    const nextPoint = getCoordinatesOnWindow(event, 1)
    const nextScrollLeft = Math.floor(pointerCaptureCoordinates[0] - nextPoint[0])
    const nextScrollTop = Math.floor(pointerCaptureCoordinates[1] - nextPoint[1])
    canvas.parentNode.scrollLeft = nextScrollLeft < 0 ? 0 : nextScrollLeft
    canvas.parentNode.scrollTop = nextScrollTop < 0 ? 0 : nextScrollTop
}

const stopMoveCanvas = () => {
    pointerCaptureCoordinates = null

    canvas.removeEventListener('mousemove', trackMoveCanvas)
    canvas.removeEventListener('mouseup', stopMoveCanvas)
    canvas.removeEventListener('touchmove', trackMoveCanvas)
    canvas.removeEventListener('touchend', stopMoveCanvas)
}

const trackSelectFrame = (event) => {
    selectionFramePoints = sortRectCoords([pointerCaptureCoordinates, getCoordinates(event)])

    cursorSelectedElements = []

    for (let i = savedElements.length - 1; i >= 0; i -= 1) {
        const element = savedElements[i]

        if (element.borders[0][0] > selectionFramePoints[0][0]
            && element.borders[0][1] > selectionFramePoints[0][1]
            && element.borders[1][0] < selectionFramePoints[1][0]
            && element.borders[1][1] < selectionFramePoints[1][1]) {
            cursorSelectedElements.push(element)
        }
    }
}

const stopSelectFrame = () => {
    canvas.removeEventListener('mousemove', trackSelectFrame)
    canvas.removeEventListener('mouseup', stopSelectFrame)

    selectionFramePoints = null
    pointerCaptureCoordinates = null
}

const startMove = (event) => {
    if (isPointer(selectedType)) {
        if (cursorSelectedControlPoint) {
            pointerCaptureCoordinates = getCoordinates(event)
            canvas.addEventListener('mousemove', trackResizeElements)
            canvas.addEventListener('mouseup', stopResizeElements)
            canvas.addEventListener('touchmove', trackResizeElements)
            canvas.addEventListener('touchend', stopResizeElements)
        } else if (cursorSelectedElements.length) {
            pointerCaptureCoordinates = getCoordinates(event)
            canvas.addEventListener('mousemove', trackMoveElements)
            canvas.addEventListener('mouseup', stopMoveElements)
            canvas.addEventListener('touchmove', trackMoveElements)
            canvas.addEventListener('touchend', stopMoveElements)
        } else {
            pointerCaptureCoordinates = getCoordinates(event, 1, 1)
            canvas.addEventListener('mousemove', trackMoveCanvas)
            canvas.addEventListener('mouseup', stopMoveCanvas)
            canvas.addEventListener('touchmove', trackMoveCanvas)
            canvas.addEventListener('touchend', stopMoveCanvas)
        }
    }
}

const startSelection = (event) => {
    if (isPointer(selectedType)) {
        pointerCaptureCoordinates = getCoordinates(event)
        canvas.addEventListener('mousemove', trackSelectFrame)
        canvas.addEventListener('mouseup', stopSelectFrame)
    }
}

canvas.addEventListener('mousedown', withDoubleClick(startSelection, true))
canvas.addEventListener('touchstart', withDoubleClick(startSelection, true))
canvas.addEventListener('mousedown', withDoubleClick(startMove, false))
canvas.addEventListener('touchstart', withDoubleClick(startMove, false))
