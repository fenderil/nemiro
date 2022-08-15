const roundRect = (points, radius = 5) => {
    canvasContext.beginPath()
    canvasContext.moveTo(points[0][0] + radius, points[0][1])
    canvasContext.lineTo(points[1][0] - radius, points[0][1])
    canvasContext.quadraticCurveTo(points[1][0], points[0][1], points[1][0], points[0][1] + radius)
    canvasContext.lineTo(points[1][0], points[1][1] - radius)
    canvasContext.quadraticCurveTo(points[1][0], points[1][1], points[1][0] - radius, points[1][1])
    canvasContext.lineTo(points[0][0] + radius, points[1][1])
    canvasContext.quadraticCurveTo(points[0][0], points[1][1], points[0][0], points[1][1] - radius)
    canvasContext.lineTo(points[0][0], points[0][1] + radius)
    canvasContext.quadraticCurveTo(points[0][0], points[0][1], points[0][0] + radius, points[0][1])
    canvasContext.closePath()
    canvasContext.fill()
}

const drawFilledRect = (points, color) => {
    let reservedColor = canvasContext.fillStyle
    canvasContext.fillStyle = 'black'
    roundRect(points.map((p) => p.map((c) => c + 2)))
    canvasContext.fillStyle = color
    roundRect(points)
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
 
const luma = (color) => {
    const rgb = hexToRGBArray(color)
    return (0.2126 * rgb[0]) + (0.7152 * rgb[1]) + (0.0722 * rgb[2])
}
const hexToRGBArray = (color) => {
    color = color.toUpperCase()
    if (/^#[0-9A-F]{6}$/.test(color)) {
        const [, ...components] = color.match(/([0-9A-F]{2})([0-9A-F]{2})([0-9A-F]{2})/)
        return components.map((component) => parseInt(component, 16))
    } else if (/^rgb\(([\d]{1,3}),([\d]{1,3}),([\d]{1,3})\)$/.test(color)) {
        const [, ...components] = color.match(/([\d]{1,3}),([\d]{1,3}),([\d]{1,3})/)
        return components.map((component) => parseInt(component, 16))
    }
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
    drawText(points, text, luma(color) >= 165 ? '#000000' : '#ffffff')
}

const drawCursor = ([x, y], color) => {
    drawLine([[x, y], [x + 6, y + 16], [x + 8, y + 8], [x + 16, y + 6], [x, y]], color)
}

const drawBorder = ([[x1, y1], [x2, y2]], label) => {
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

const redrawElement = (element) => {
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

const redrawScreen = () => {
    canvasContext.clearRect(0, 0, canvas.width, canvas.height)

    savedElements.forEach((element) => {
        if (!workInProgressElement || element.id !== workInProgressElement.id) {
            redrawElement(element)
        }
    })
    
    savedUsers.forEach((user) => {
        if (user.cursor && user.online && choosenName !== user.name) {
            drawCursor(user.cursor, '#63DB93')
            drawText([[user.cursor[0], user.cursor[1] - 20]], user.name, '#63DB93')
        }
    })

    if (!workInProgressElement && cursorHoveredElement) {
        if (['rect', 'row', 'text', 'sticker'].includes(cursorHoveredElement.type)) {
            drawBorder(cursorHoveredElement.points, cursorHoveredElement.author)
        } else if (['line'].includes(cursorHoveredElement.type)) {
            drawBorder(cursorHoveredElement.borders, cursorHoveredElement.author)
        }
    }

    if (workInProgressElement) {
        redrawElement(workInProgressElement)
    }
}
