const roundRect = (unsortedPoints, {
    radius = 5,
    strokeColor,
    fillColor
} = {}) => {
    const points = sortRectCoords(unsortedPoints)

    let reservedFillColor = canvasContext.fillStyle
    let reservedStrokeColor = canvasContext.strokeStyle
    canvasContext.fillStyle = fillColor
    canvasContext.strokeStyle = strokeColor

    const minRadiusX = Math.min(radius, (points[1][0] - points[0][0]) / 2)
    const minRadiusY = Math.min(radius, (points[1][1] - points[0][1]) / 2)

    canvasContext.beginPath()
    canvasContext.moveTo(points[0][0] + minRadiusX, points[0][1])
    canvasContext.lineTo(points[1][0] - minRadiusX, points[0][1])
    canvasContext.quadraticCurveTo(points[1][0], points[0][1], points[1][0], points[0][1] + minRadiusY)
    canvasContext.lineTo(points[1][0], points[1][1] - minRadiusY)
    canvasContext.quadraticCurveTo(points[1][0], points[1][1], points[1][0] - minRadiusX, points[1][1])
    canvasContext.lineTo(points[0][0] + minRadiusX, points[1][1])
    canvasContext.quadraticCurveTo(points[0][0], points[1][1], points[0][0], points[1][1] - minRadiusY)
    canvasContext.lineTo(points[0][0], points[0][1] + minRadiusY)
    canvasContext.quadraticCurveTo(points[0][0], points[0][1], points[0][0] + minRadiusX, points[0][1])
    canvasContext.closePath()

    if (fillColor) {
        canvasContext.fill()
    }
    if (strokeColor) {
        canvasContext.stroke()
    }
    
    canvasContext.fillStyle = reservedFillColor
    canvasContext.strokeColor = reservedStrokeColor
}

const drawFilledRect = (points, color) => {
    roundRect(points.map((p) => p.map((c) => c + 2)), { fillColor: '#555' })
    roundRect(points, { fillColor: color })
}

const drawRect = (points, color) => {
    roundRect(points, { strokeColor: color, radius: 10 })
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
    const lines = createMultilineText(text, Infinity).split(/[\r\n]/)
    
    canvasContext.fillStyle = color
    lines.forEach((row, i) => {
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
    const lines = createMultilineText(text, MAX_STICKER_WIDTH).split(/[\r\n]/)
    const maxLineWidth = Math.max(...lines.map((line) => canvasContext.measureText(line).width || 0))

    drawFilledRect([
        points[0].map((coord) => coord - 4),
        [
            points[0][0] + Math.min(maxLineWidth, MAX_STICKER_WIDTH) + 4,
            points[0][1] + lines.length * 20 + 4,
        ]
    ], color)
    drawText(points, text, luma(color) >= 165 ? '#000000' : '#ffffff')
}

const drawCursor = ([x, y], color) => {
    drawLine([[x, y], [x + 6, y + 16], [x + 8, y + 8], [x + 16, y + 6], [x, y]], color)
}

const drawBorder = ([[x1, y1], [x2, y2]], label, color) => {
    drawRect([
        [x1 - 4, y1 - 4],
        [x2 + 4, y2 + 4]
    ], color)
    drawSticker([[x1, y1 - 24]], label, color)
}

const redrawElement = (element) => {
    if (element.type === 'rect') {
        drawRect(element.points, element.color)
    } else if (element.type === 'row') {
        drawRow(element.points, element.color)
    } else if (element.type === 'line') {
        drawLine(element.points, element.color)
    } else if (element.type === 'text' && element.text) {
        drawText(element.points, element.text, element.color)
    } else if (element.type === 'sticker' && element.text) {
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

    if (!workInProgressElement && cursorHoveredElements.length) {
        cursorHoveredElements.forEach((cursorHoveredElement) => {
            drawBorder(cursorHoveredElement.borders || cursorHoveredElement.points, cursorHoveredElement.author, '#d26565')
        })
    }
    if (selectionFramePoints) {
        drawBorder(selectionFramePoints, 'Selection frame', '#65d265')
    }

    if (workInProgressElement) {
        redrawElement(workInProgressElement)
    }
}
