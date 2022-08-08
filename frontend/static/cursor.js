let selectedElement = null

const drawBorder = ([[x1, y1], [x2, y2]], label) => {
    redrawScreen()

    const minX = x1 < x2 ? x1 : x2
    const minY = y1 < y2 ? y1 : y2
    const maxX = x1 > x2 ? x1 : x2
    const maxY = y1 > y2 ? y1 : y2

    drawRect([
        [minX - 4, minY - 4],
        [maxX + 4, maxY + 4]
    ], '#d26565')
    drawSticker([[minX, minY - 24]], label, '#d26565')
}

const isCursorInBox = (point1, point2, cursor) => {
    const minX = Math.min(point1[0], point2[0])
    const minY = Math.min(point1[1], point2[1])
    const maxX = Math.max(point1[0], point2[0])
    const maxY = Math.max(point1[1], point2[1])

    return (
        minX <= cursor[0] && maxX >= cursor[0] &&
        minY <= cursor[1] && maxY >= cursor[1]
    )
}

const startTrackCursor = (event) => {
    if (['pointer'].includes(type) && !movingElement && !cursotStartTrackMoveCanvas) {
        redrawScreen()
        selectedElement = null

        for (let i = elements.length - 1; i >= 0; i -= 1) {
            const element = elements[i]
            const [x, y] = getCoordinates(event)
            
            let minX = null
            let minY = null
            let maxX = null
            let maxY = null

            if (element.type === 'rect' || element.type === 'text' || element.type === 'sticker') {
                // TODO: rect не залит, надо искать по приближению к линиям
                if (isCursorInBox(element.points[0], element.points[1], [x, y])) {
                    selectedElement = element

                    drawBorder(element.points, element.author)

                    break
                }
            } else if (element.type === 'row') {
                if (distanceToLine(...element.points[0], ...element.points[1], x, y) < 16) {
                    selectedElement = element

                    drawBorder(element.points, element.author)

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
                    selectedElement = element

                    drawBorder([[minX, minY], [maxX, maxY]], element.author)
                    
                    break
                }
            }
        }
    }
}

const contextMenu = document.getElementById('contextMenu')
const editContext = document.getElementById('editContext')
const deleteContext = document.getElementById('deleteContext')
let deleteCommand
let editCommand
let contextMenuOpened = false
const showContextMenu = (event, selectedElement) => {
    deleteCommand = () => {
        socket.send(JSON.stringify({
            id: selectedElement.id,
            action: 'delete'
        }))
    }
    
    editCommand = () => {
        if (selectedElement.type === 'text' || selectedElement.type === 'sticker') {
            tempPoints = selectedElement.points
            editableText(selectedElement)
        }
    }
    editContext.addEventListener('click', editCommand)
    deleteContext.addEventListener('click', deleteCommand)
    const [left, top] = getCoordinates(event)
    contextMenu.style.left = `${left}px`
    contextMenu.style.top = `${top}px`
    contextMenu.classList.remove('hidden')
}

const hideContextMenu = () => {
    contextMenu.classList.add('hidden')
    deleteContext.removeEventListener('click', deleteCommand)
}

const trackContextMenu = (event) => {
    if (!contextMenuOpened && selectedElement && !movingPoints && type === 'pointer') {
        contextMenuOpened = true
        showContextMenu(event, selectedElement)
    } else {
        contextMenuOpened = false
        hideContextMenu()
    }
    selectedElement = null
}
canvas.addEventListener('mouseup', trackContextMenu)
canvas.addEventListener('touchend', trackContextMenu)

canvas.addEventListener('mousemove', startTrackCursor)
canvas.addEventListener('touchmove', startTrackCursor)

let movingElement = null
let movingPoints = null
const trackMoveElement = (event) => {
    const [x, y] = getCoordinates(event)
    redrawScreen()

    const diffX = movingElement.points[0][0] - x
    const diffY = movingElement.points[0][1] - y
    
    movingPoints = movingElement.points.map((point) => [point[0] - diffX, point[1] - diffY])

    if (movingElement.type === 'rect') {
        drawRect(movingPoints, movingElement.color)
    } else if (movingElement.type === 'row') {
        drawRow(movingPoints, movingElement.color)
    } else if (movingElement.type === 'line') {
        drawLine(movingPoints, movingElement.color)
    } else if (movingElement.type === 'text') {
        drawText(movingPoints, movingElement.text, movingElement.color)
    } else if (movingElement.type === 'sticker') {
        drawSticker(movingPoints, movingElement.text, movingElement.color)
    }
}

const stopMoveElement = () => {
    if (movingPoints) {
        socket.send(JSON.stringify({
            ...movingElement,
            action: 'move',
            points: movingPoints
        }))
    }

    movingElement = null
    movingPoints = null
    
    canvas.removeEventListener('mousemove', trackMoveElement)
    canvas.removeEventListener('mouseup', stopMoveElement)
    canvas.removeEventListener('touchmove', trackMoveElement)
    canvas.removeEventListener('touchend', stopMoveElement)
}

let cursotStartTrackMoveCanvas = null

const trackMoveCanvas = (event) => {
    const nextPoint = getCoordinatesOnWindow(event)
    const nextScrollLeft = Math.floor(cursotStartTrackMoveCanvas[0] - nextPoint[0])
    const nextScrollTop = Math.floor(cursotStartTrackMoveCanvas[1] - nextPoint[1])
    canvas.parentNode.scrollLeft = nextScrollLeft < 0 ? 0 : nextScrollLeft
    canvas.parentNode.scrollTop = nextScrollTop < 0 ? 0 : nextScrollTop
}

const stopMoveCanvas = () => {
    cursotStartTrackMoveCanvas = null
    
    canvas.removeEventListener('mouseup', stopMoveCanvas)
    canvas.removeEventListener('mousemove', trackMoveCanvas)
    canvas.removeEventListener('touchmove', trackMoveCanvas)
    canvas.removeEventListener('touchend', stopMoveCanvas)
}

const startMove = (event) => {
    if (['pointer'].includes(type)) {
        movingElement = selectedElement
        if (movingElement) {
            canvas.addEventListener('mousemove', trackMoveElement)
            canvas.addEventListener('mouseup', stopMoveElement)
            canvas.addEventListener('touchmove', trackMoveElement)
            canvas.addEventListener('touchend', stopMoveElement)
        } else {
            cursotStartTrackMoveCanvas = getCoordinates(event)
            canvas.addEventListener('mousemove', trackMoveCanvas)
            canvas.addEventListener('mouseup', stopMoveCanvas)
            canvas.addEventListener('touchmove', trackMoveCanvas)
            canvas.addEventListener('touchend', stopMoveCanvas)
        }
    }
}
canvas.addEventListener('mousedown', startMove)
canvas.addEventListener('touchstart', startMove)
