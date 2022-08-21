const trackFigure = (event) => {
    if (selectedType === 'rect') {
        workInProgressElement.points[1] = getCoordinates(event)
    } else if (selectedType === 'row') {
        workInProgressElement.points[1] = getCoordinates(event)
    } else if (selectedType === 'line') {
        workInProgressElement.points.push(getCoordinates(event))
    }
    
    redrawScreen()
}

const sendFigure = () => {
    networkChannel.send(JSON.stringify({
        ...workInProgressElement,
        action: 'add'
    }))

    canvas.removeEventListener('mousemove', trackFigure)
    canvas.removeEventListener('mouseup', sendFigure)
    canvas.removeEventListener('touchmove', trackFigure)
    canvas.removeEventListener('touchend', sendFigure)
    
    workInProgressElement = null
}

const startFigure = (event) => {
    if (['rect', 'line', 'row'].includes(selectedType)) {
        workInProgressElement = {
            points: [getCoordinates(event), getCoordinates(event)],
            type: selectedType,
            color: selectedColor
        }
    
        canvas.addEventListener('mousemove', trackFigure)
        canvas.addEventListener('mouseup', sendFigure)
        canvas.addEventListener('touchmove', trackFigure)
        canvas.addEventListener('touchend', sendFigure)
    }
}

canvas.addEventListener('mousedown', startFigure)
canvas.addEventListener('touchstart', startFigure)
