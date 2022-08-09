let elements = []

const drawFilledRect = (points, color, selected) => {
    const reservedColor = canvasContext.fillStyle
    canvasContext.fillStyle = color

    canvasContext.fillRect(
        points[0][0],
        points[0][1],
        points[1][0] - points[0][0],
        points[1][1] - points[0][1]
    )
    drawRect(points, 'white', selected)

    canvasContext.fillStyle = reservedColor
}

const drawRect = (points, color) => {
    const reservedColor = canvasContext.strokeStyle
    canvasContext.strokeStyle = color

    canvasContext.strokeRect(
        points[0][0],
        points[0][1],
        points[1][0] - points[0][0],
        points[1][1] - points[0][1]
    )

    canvasContext.strokeStyle = reservedColor
}

const drawRow = (points, color) => {
    const reservedColor = canvasContext.strokeStyle
    canvasContext.strokeStyle = color
    
    canvasContext.beginPath()
    canvasContext.moveTo(points[0][0], points[0][1])
    canvasContext.lineTo(points[1][0], points[1][1])
    canvasContext.stroke()

    canvasContext.strokeStyle = reservedColor
}

const drawLine = (points, color) => {
    const reservedColor = canvasContext.strokeStyle
    canvasContext.strokeStyle = color
    
    canvasContext.beginPath()
    canvasContext.moveTo(points[0][0], points[0][1])
    points.forEach((point) => {
        canvasContext.lineTo(point[0], point[1])
    })
    canvasContext.stroke()

    canvasContext.strokeStyle = reservedColor
}

const drawText = (points, text, color) => {
    const reservedFill = canvasContext.fillStyle
    const rows = splitOnRows(text, Infinity)
    
    canvasContext.fillStyle = color
    rows.forEach((row, i) => {
        canvasContext.fillText(row, points[0][0], points[0][1] + 2 + i * 20)
    })

    canvasContext.fillStyle = reservedFill
}

const drawSticker = (points, text, color) => {
    const rows = splitOnRows(text, MAX_STICKER_WIDTH)
    const maxRowWidth = Math.max(...rows.map((row) => canvasContext.measureText(row).width || 0))

    drawFilledRect([
        points[0].map((coord) => coord - 4),
        [
            points[0][0] + Math.min(maxRowWidth, MAX_STICKER_WIDTH) + 4,
            points[0][1] + rows.length * 20 + 4,
        ]
    ], color, true)
    drawText(points, text, color === 'black' ? 'white' : 'black')
}


const redrawScreen = (excludeId) => {
    canvasContext.clearRect(0, 0, canvas.width, canvas.height)

    elements.forEach((element) => {
        if (element.id !== excludeId) {
            if (element.type === 'rect') {
                drawRect(element.points, element.color)
            } else if (element.type === 'row') {
                drawRow(element.points, element.color)
            } else if (element.type === 'line') {
                drawLine(element.points, element.color)
            } else if (element.type === 'text') {
                drawText(element.points, element.text, element.color)
            } else if (element.type === 'sticker') {
                drawSticker(element.points, element.text, element.color)
            }
        }
    })
}
