let tempPoints = []

const trackFigure = (event) => {
    redrawScreen()

    if (type === 'rect') {
        tempPoints[1] = getCoordinates(event)
        drawRect(tempPoints, color)
    } else if (type === 'row') {
        tempPoints[1] = getCoordinates(event)
        drawRow(tempPoints, color)
    } else if (type === 'line') {
        tempPoints.push(getCoordinates(event))
        drawLine(tempPoints, color)
    }
}

const sendFigure = (event) => {
    socket.send(JSON.stringify({
        type,
        points: tempPoints,
        color
    }))

    canvas.removeEventListener('mousemove', trackFigure)
    canvas.removeEventListener('mouseup', sendFigure)
    canvas.removeEventListener('touchmove', trackFigure)
    canvas.removeEventListener('touchend', sendFigure)
    
    tempPoints = []
}

const startFigure = (event) => {
    if (['rect', 'line', 'row'].includes(type)) {
        tempPoints = [getCoordinates(event), getCoordinates(event)]
    
        canvas.addEventListener('mousemove', trackFigure)
        canvas.addEventListener('mouseup', sendFigure)
        canvas.addEventListener('touchmove', trackFigure)
        canvas.addEventListener('touchend', sendFigure)
    }
}

canvas.addEventListener('mousedown', startFigure)
canvas.addEventListener('touchstart', startFigure)
