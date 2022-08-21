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
        cursorHoveredElement = null

        for (let i = savedElements.length - 1; i >= 0; i -= 1) {
            const element = savedElements[i]
            
            let minX = null
            let minY = null
            let maxX = null
            let maxY = null

            if (['rect', 'text', 'sticker'].includes(element.type)) {
                // TODO: rect не залит, надо искать по приближению к линиям
                if (isCursorInBox([element.points[0], element.points[1]], [x, y])) {
                    cursorHoveredElement = element

                    break
                }
            } else if (element.type === 'row') {
                if (distanceToLine([element.points[0], element.points[1]], [x, y]) < 16) {
                    cursorHoveredElement = element

                    break
                }
            } else if (element.type === 'line') {
                let foundedPoint = false
                element.points.forEach((point) => {
                    minX = minX === null ? point[0] : Math.min(minX, point[0])
                    minY = minY === null ? point[1] : Math.min(minY, point[1])
                    maxX = maxX === null ? point[0] : Math.max(maxX, point[0])
                    maxY = maxY === null ? point[1] : Math.max(maxY, point[1])
                    if (Math.pow(point[0] - x, 2) + Math.pow(point[1] - y, 2) < 256) {
                        foundedPoint = true
                    }
                })

                if (foundedPoint) {
                    cursorHoveredElement = element
                    cursorHoveredElement.borders = [[minX, minY], [maxX, maxY]]
                    
                    break
                }
            }
        }
    }
}

const showContextMenu = (event, contextElement) => {
    contextDeleteHandler = () => {
        networkChannel.send(JSON.stringify({
            id: contextElement.id,
            action: 'delete'
        }))
    }
    
    // Второе редактирование за раз ломается
    contextEditHandler = () => {
        if (contextElement.type === 'text' || contextElement.type === 'sticker') {
            workInProgressElement = contextElement
            
            editableText(contextElement)
        }
    }
    editContext.addEventListener('click', contextEditHandler)
    deleteContext.addEventListener('click', contextDeleteHandler)
    const [left, top] = getCoordinatesOnWindow(event)
    contextMenu.style.left = `${left}px`
    contextMenu.style.top = `${top}px`
    contextMenu.classList.remove('hidden')
}

const hideContextMenu = () => {
    contextMenu.classList.add('hidden')
    deleteContext.removeEventListener('click', contextDeleteHandler)
}

const trackContextMenu = (event) => {
    if (!contextMenuOpened && cursorHoveredElement && selectedType === 'pointer') {
        contextMenuOpened = true
        showContextMenu(event, cursorHoveredElement)
    } else {
        contextMenuOpened = false
        hideContextMenu()
    }
    cursorHoveredElement = null
}
canvas.addEventListener('mouseup', trackContextMenu)
canvas.addEventListener('touchend', trackContextMenu)

canvas.addEventListener('mousemove', startTrackCursor)
canvas.addEventListener('touchmove', startTrackCursor)

const trackMoveElement = (event) => {
    const nextCoordinates = getCoordinates(event)

    const diffX = pointerCaptureCoordinates[0] - nextCoordinates[0]
    const diffY = pointerCaptureCoordinates[1] - nextCoordinates[1]
    
    pointerCaptureCoordinates = nextCoordinates
    
    workInProgressElement.points = workInProgressElement.points.map((point) => [point[0] - diffX, point[1] - diffY])
    
    redrawScreen()
}

const stopMoveElement = () => {
    if (workInProgressElement) {
        networkChannel.send(JSON.stringify({
            ...workInProgressElement,
            action: 'move'
        }))
    }

    pointerCaptureCoordinates = null
    workInProgressElement = null
    
    canvas.removeEventListener('mousemove', trackMoveElement)
    canvas.removeEventListener('mouseup', stopMoveElement)
    canvas.removeEventListener('touchmove', trackMoveElement)
    canvas.removeEventListener('touchend', stopMoveElement)
}

const trackMoveCanvas = (event) => {
    const nextPoint = getCoordinatesOnWindow(event)
    const nextScrollLeft = Math.floor(pointerCaptureCoordinates[0] - nextPoint[0])
    const nextScrollTop = Math.floor(pointerCaptureCoordinates[1] - nextPoint[1])
    canvas.parentNode.scrollLeft = nextScrollLeft < 0 ? 0 : nextScrollLeft
    canvas.parentNode.scrollTop = nextScrollTop < 0 ? 0 : nextScrollTop
}

const stopMoveCanvas = () => {
    pointerCaptureCoordinates = null
    
    canvas.removeEventListener('mouseup', stopMoveCanvas)
    canvas.removeEventListener('mousemove', trackMoveCanvas)
    canvas.removeEventListener('touchmove', trackMoveCanvas)
    canvas.removeEventListener('touchend', stopMoveCanvas)
}

const startMove = (event) => {
    if (['pointer'].includes(selectedType)) {
        workInProgressElement = cursorHoveredElement
        pointerCaptureCoordinates = getCoordinates(event)
        
        if (workInProgressElement) {
            canvas.addEventListener('mousemove', trackMoveElement)
            canvas.addEventListener('mouseup', stopMoveElement)
            canvas.addEventListener('touchmove', trackMoveElement)
            canvas.addEventListener('touchend', stopMoveElement)
        } else {
            canvas.addEventListener('mousemove', trackMoveCanvas)
            canvas.addEventListener('mouseup', stopMoveCanvas)
            canvas.addEventListener('touchmove', trackMoveCanvas)
            canvas.addEventListener('touchend', stopMoveCanvas)
        }
    }
}

canvas.addEventListener('mousedown', startMove)
canvas.addEventListener('touchstart', startMove)
