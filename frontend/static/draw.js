const roundRect = (unsortedPoints, {
  radius = 5,
  strokeColor,
  fillColor,
} = {}) => {
  const points = sortRectCoords(unsortedPoints)

  const reservedFillColor = canvasContext.fillStyle
  const reservedStrokeColor = canvasContext.strokeStyle
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

const drawCircle = (center, radius, {
  strokeColor,
  fillColor,
}) => {
  const reservedFillColor = canvasContext.fillStyle
  const reservedStrokeColor = canvasContext.strokeStyle
  canvasContext.fillStyle = fillColor
  canvasContext.strokeStyle = strokeColor

  canvasContext.beginPath()
  canvasContext.arc(center[0], center[1], radius, 0, 2 * Math.PI, false)

  if (fillColor) {
    canvasContext.fill()
  }
  if (strokeColor) {
    canvasContext.stroke()
  }

  canvasContext.fillStyle = reservedFillColor
  canvasContext.strokeColor = reservedStrokeColor
}

const imagesMap = {}
const drawImage = (points, url) => {
  if (imagesMap[url]) {
    canvasContext.drawImage(
      imagesMap[url],
      points[0][0],
      points[0][1],
      points[1][0] - points[0][0],
      points[1][1] - points[0][1],
    )
  } else {
    const image = new Image()
    image.src = url
    image.onload = () => {
      imagesMap[url] = image
      canvasContext.drawImage(
        imagesMap[url],
        points[0][0],
        points[0][1],
        points[1][0] - points[0][0],
        points[1][1] - points[0][1],
      )
    }
  }
}

const drawFilledRect = (points, color) => {
  roundRect(points.map((p) => p.map((c) => c + 2)), { fillColor: '#555' })
  roundRect(points, { fillColor: color })
}

const drawRect = (points, color) => {
  roundRect(points, { strokeColor: color, radius: 10 })
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

const drawSticker = (points, text, color) => {
  const lines = createMultilineText(text, MAX_STICKER_WIDTH).split(/[\r\n]/)
  const maxLineWidth = Math.max(...lines.map((line) => canvasContext.measureText(line).width || 0))

  drawFilledRect([
    points[0].map((coord) => coord - 4),
    [
      points[0][0] + Math.min(maxLineWidth, MAX_STICKER_WIDTH) + 4,
      points[0][1] + lines.length * 20 + 4,
    ],
  ], color)
  drawText(points, text, luma(color) >= 165 ? '#000000' : '#ffffff')
}

const drawCursor = ([x, y], color) => {
  drawLine([[x, y], [x + 6, y + 16], [x + 8, y + 8], [x + 16, y + 6], [x, y]], color)
}

const drawBorder = (unsortedPoints, color, label) => {
  const [[x1, y1], [x2, y2]] = sortRectCoords(unsortedPoints)
  drawRect([
    [x1 - 4, y1 - 4],
    [x2 + 4, y2 + 4],
  ], color)
  if (label) {
    drawSticker([[x1, y1 - 24]], label, color)
  }
}

const drawBorderPoints = (borders) => {
  createControlPoints(borders)
    .forEach((controlPoint) => {
      const controlPointHovered = cursorSelectedControlPoint
        ? isPointsEqual(cursorSelectedControlPoint, controlPoint)
        : false
      drawCircle(controlPoint, controlPointHovered ? 8 : 6, { fillColor: 'white', strokeColor: 'black' })
    })
}

const redrawElement = (element) => {
  if (isRectElement(element)) {
    drawRect(element.points, element.color)
  } else if (isLineElement(element) || isRowElement(element)) {
    drawLine(element.points, element.color)
  } else if (isImageElement(element)) {
    drawImage(element.points, element.url)
  } else if (isTextElement(element) && element.text) {
    drawText(element.points, element.text, element.color)
  } else if (isStickerElement(element) && element.text) {
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
      drawBorder(cursorHoveredElement.borders || cursorHoveredElement.points, '#f2c5c5', cursorHoveredElement.author)
    })
  }
  if (!workInProgressElement && cursorSelectedElements.length) {
    cursorSelectedElements.forEach((cursorSelectedElement) => {
      drawBorder(cursorSelectedElement.borders || cursorSelectedElement.points, '#d26565')

      if (cursorSelectedElement.borders && !isEditableElement(cursorSelectedElement)) {
        drawBorderPoints(cursorSelectedElement.borders)
      }
    })
  }
  if (selectionFramePoints) {
    drawBorder(selectionFramePoints, '#65d265', 'Selection frame')
  }

  if (workInProgressElement) {
    redrawElement(workInProgressElement)
  }
}
