const findCursoredElement = (elements = [], cursor) =>
    elements
        .find((element) => !isEditableElement(element) && isCursorInBox(element.borders, cursor))

const findCursoredControlPoint = (borders, cursor) =>
    createControlPoints(borders)
        .find((controlPoint) => isCursorNearPoint(controlPoint, cursor))

const startTrackCursor = (event) => {
    const cursorPoint = getCoordinates(event)

    sendDataUpdate({
        type: 'cursor',
        cursor: cursorPoint
    })

    if (isPointer(selectedType) && !pointerCaptureCoordinates && !workInProgressElement && !movingElements.length) {
        const cursoredElement = findCursoredElement(cursorHoveredElements, cursorPoint)
        
        cursorHoveredControlPoint = cursoredElement && cursoredElement.borders
            ? findCursoredControlPoint(cursoredElement.borders, cursorPoint) || null
            : null

        if (!cursoredElement) {
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
}

const showContextMenu = (event, contextElements) => {
    contextDeleteHandler = () => {
        contextElements.forEach((contextElement) => {
            sendDataUpdate({
                id: contextElement.id,
                action: 'delete'
            })
        })
        
        contextMenuOpened = false
        hideContextMenu()
    }
    
    contextEditHandler = () => {
        if (isEditableElement(contextElements[0])) {
            workInProgressElement = contextElements[0]
            editableText(contextElements[0])
        
            contextMenuOpened = false
            hideContextMenu()
        }
    }

    if (contextElements.length > 1 || !isEditableElement(contextElements[0])) {    
        editContext.classList.add('hidden')
    } else {
        editContext.addEventListener('click', contextEditHandler)
    }

    deleteContext.addEventListener('click', contextDeleteHandler)
    const [left, top] = getCoordinatesOnWindow(event, 1)
    contextMenu.style.left = `${left}px`
    contextMenu.style.top = `${top}px`
    contextMenu.classList.remove('hidden')
}

const hideContextMenu = () => {
    contextMenu.classList.add('hidden')
    editContext.classList.remove('hidden')
    editContext.removeEventListener('click', contextEditHandler)
    deleteContext.removeEventListener('click', contextDeleteHandler)
}

const trackContextMenu = (event) => {
    if (!contextMenuOpened && cursorHoveredElements.length && isPointer(selectedType)) {
        contextMenuOpened = true
        showContextMenu(event, cursorHoveredElements)
    } else {
        contextMenuOpened = false
        hideContextMenu()
    }
    cursorHoveredElements = []
}
const trackContextMenuWithRightMouseButton = (event) => {
    event.preventDefault()
    trackContextMenu(event)
}
canvas.addEventListener('contextmenu', trackContextMenuWithRightMouseButton)
canvas.addEventListener('touchend', trackContextMenu)

canvas.addEventListener('mousemove', startTrackCursor)
canvas.addEventListener('touchmove', startTrackCursor)

const trackMoveElements = (event) => {
    const nextCoordinates = getCoordinates(event)

    const diffX = pointerCaptureCoordinates[0] - nextCoordinates[0]
    const diffY = pointerCaptureCoordinates[1] - nextCoordinates[1]
    
    pointerCaptureCoordinates = nextCoordinates
    
    // TODO: use workInProgressElement?
    movingElements.forEach((movingElement) => {
        movingElement.points = movingElement.points.map((point) => [point[0] - diffX, point[1] - diffY])
        movingElement.borders = movingElement.borders.map((point) => [point[0] - diffX, point[1] - diffY])
    })
    
    redrawScreen()
}

const stopMoveElements = () => {
    if (movingElements.length) {
        movingElements.forEach((movingElement) => {
            sendDataUpdate({
                ...movingElement,
                action: 'move'
            })
        })
    }

    pointerCaptureCoordinates = null
    movingElements = []
    
    canvas.removeEventListener('mousemove', trackMoveElements)
    canvas.removeEventListener('mouseup', stopMoveElements)
    canvas.removeEventListener('touchmove', trackMoveElements)
    canvas.removeEventListener('touchend', stopMoveElements)
}

const trackResizeElements = (event) => {
    const nextCoordinates = getCoordinates(event)

    if (!cursorFixedControlPoint) {
        const borders = movingElements[0].borders
        cursorFixedControlPoint = [
            borders[0][0] === cursorHoveredControlPoint[0] ? borders[1][0] : borders[0][0],
            borders[0][1] === cursorHoveredControlPoint[1] ? borders[1][1] : borders[0][1]
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
            
            movingElements[0].points = movingElements[0].points.map((point) => [
                cursorFixedControlPoint[0] + (point[0] - cursorFixedControlPoint[0]) * scaleX,
                cursorFixedControlPoint[1] + (point[1] - cursorFixedControlPoint[1]) * scaleY
            ])
            movingElements[0].borders = movingElements[0].borders.map((point) => [
                cursorFixedControlPoint[0] + (point[0] - cursorFixedControlPoint[0]) * scaleX,
                cursorFixedControlPoint[1] + (point[1] - cursorFixedControlPoint[1]) * scaleY
            ])
    
            redrawScreen()
        }
    }
}

const stopResizeElements = () => {
    sendDataUpdate({
        ...movingElements[0],
        action: 'resize'
    })

    pointerCaptureCoordinates = null
    movingElements = []
    cursorHoveredControlPoint = null
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

    cursorHoveredElements = []

    for (let i = savedElements.length - 1; i >= 0; i -= 1) {
        const element = savedElements[i]

        if (element.borders[0][0] > selectionFramePoints[0][0] &&
            element.borders[0][1] > selectionFramePoints[0][1] &&
            element.borders[1][0] < selectionFramePoints[1][0] &&
            element.borders[1][1] < selectionFramePoints[1][1]) {
            cursorHoveredElements.push(element)
        }
    }
}

const stopSelectFrame = () => {
    canvas.removeEventListener('mousemove', trackSelectFrame)
    canvas.removeEventListener('mouseup', stopSelectFrame)

    selectionFramePoints = null
}

const startMove = (event) => {
    if (isPointer(selectedType)) {
        movingElements = cursorHoveredElements
        
        if (event.ctrlKey) {
            pointerCaptureCoordinates = getCoordinates(event)
            canvas.addEventListener('mousemove', trackSelectFrame)
            canvas.addEventListener('mouseup', stopSelectFrame)
        } else if (cursorHoveredControlPoint) {
            pointerCaptureCoordinates = getCoordinates(event)
            canvas.addEventListener('mousemove', trackResizeElements)
            canvas.addEventListener('mouseup', stopResizeElements)
            canvas.addEventListener('touchmove', trackResizeElements)
            canvas.addEventListener('touchend', stopResizeElements)
        } else if (movingElements.length) {
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

canvas.addEventListener('mousedown', startMove)
canvas.addEventListener('touchstart', startMove)
