const trackFigure = (event) => {
    if (isRectElement({ type: selectedType }) || isRowElement({ type: selectedType })) {
        workInProgressElement.points[1] = getCoordinates(event)
    } else if (isLineElement({ type: selectedType })) {
        workInProgressElement.points.push(getCoordinates(event))
    }

    redrawScreen()
}

const sendFigure = () => {
    sendDataUpdate({
        ...workInProgressElement,
        action: 'add',
    })

    canvas.removeEventListener('mousemove', trackFigure)
    canvas.removeEventListener('mouseup', sendFigure)
    canvas.removeEventListener('touchmove', trackFigure)
    canvas.removeEventListener('touchend', sendFigure)

    workInProgressElement = null
}

const startFigure = (event) => {
    if (isDrawingElement({ type: selectedType })) {
        workInProgressElement = {
            points: [getCoordinates(event), getCoordinates(event)],
            type: selectedType,
            color: selectedColor,
        }

        canvas.addEventListener('mousemove', trackFigure)
        canvas.addEventListener('mouseup', sendFigure)
        canvas.addEventListener('touchmove', trackFigure)
        canvas.addEventListener('touchend', sendFigure)
    }
}

canvas.addEventListener('mousedown', startFigure)
canvas.addEventListener('touchstart', startFigure)
