const isCursorInBox = (points, cursor) => {
    const [[minX, minY], [maxX, maxY]] = sortRectCoords(points)

    return (
        minX <= cursor[0] && maxX >= cursor[0] &&
        minY <= cursor[1] && maxY >= cursor[1]
    )
}

const startTrackCursor = (event) => {
    const [x, y] = getCoordinates(event)

    networkChannel.send(JSON.stringify({
        type: 'cursor',
        cursor: [x, y]
    }))

    if (['pointer'].includes(selectedType) && !workInProgressElement && !pointerCaptureCoordinates) {
        cursorHoveredElements = []

        for (let i = savedElements.length - 1; i >= 0; i -= 1) {
            const element = savedElements[i]

            if (['rect', 'text', 'sticker'].includes(element.type)) {
                // TODO: rect не залит, надо искать по приближению к линиям
                if (isCursorInBox([element.points[0], element.points[1]], [x, y])) {
                    cursorHoveredElements = [element]

                    break
                }
            } else if (element.type === 'row') {
                if (distanceToLine([element.points[0], element.points[1]], [x, y]) < 16) {
                    cursorHoveredElements = [element]

                    break
                }
            } else if (element.type === 'line') {
                let foundedPoint = false

                for (let pointIndex = 0; pointIndex < element.points.length; pointIndex += 1) {
                    if (Math.pow(element.points[pointIndex][0] - x, 2) + Math.pow(element.points[pointIndex][1] - y, 2) < 256) {
                        foundedPoint = true
                        break
                    }
                }

                if (foundedPoint) {
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
            networkChannel.send(JSON.stringify({
                id: contextElement.id,
                action: 'delete'
            }))
        })
        
        contextMenuOpened = false
        hideContextMenu()
    }
    
    contextEditHandler = () => {
        if (contextElements[0].type === 'text' || contextElements[0].type === 'sticker') {
            workInProgressElement = contextElements[0]
            editableText(contextElements[0])
        
            contextMenuOpened = false
            hideContextMenu()
        }
    }

    if (contextElements.length > 1 || !['text', 'sticker'].includes(contextElements[0].type)) {    
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
    if (!contextMenuOpened && cursorHoveredElements.length && selectedType === 'pointer') {
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
    
    movingElements.forEach((movingElement) => {
        movingElement.points = movingElement.points.map((point) => [point[0] - diffX, point[1] - diffY])
        movingElement.borders = movingElement.borders.map((point) => [point[0] - diffX, point[1] - diffY])
    })
    
    redrawScreen()
}

const stopMoveElements = () => {
    if (movingElements.length) {
        movingElements.forEach((movingElement) => {
            networkChannel.send(JSON.stringify({
                ...movingElement,
                action: 'move'
            }))
        })
    }

    pointerCaptureCoordinates = null
    movingElements = []
    
    canvas.removeEventListener('mousemove', trackMoveElements)
    canvas.removeEventListener('mouseup', stopMoveElements)
    canvas.removeEventListener('touchmove', trackMoveElements)
    canvas.removeEventListener('touchend', stopMoveElements)
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
    if (['pointer'].includes(selectedType)) {
        movingElements = cursorHoveredElements
        
        if (event.ctrlKey) {
            pointerCaptureCoordinates = getCoordinates(event)
            canvas.addEventListener('mousemove', trackSelectFrame)
            canvas.addEventListener('mouseup', stopSelectFrame)
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
