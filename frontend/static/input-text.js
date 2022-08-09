let tempInput = null

const stopTrackText = (selectedElement) => {
    redrawScreen()

    if (selectedElement.id) {
        socket.send(JSON.stringify({
            type,
            points: tempPoints,
            text: tempInput.value,
            color,
            id: selectedElement.id,
            action: 'edit'
        }))
    } else {
        socket.send(JSON.stringify({
            type,
            points: tempPoints,
            text: tempInput.value,
            color,
            action: 'add'
        }))
    }

    tempPoints = []

    tempInput.removeEventListener('input', tempInputEditHandler)
    tempInput.removeEventListener('blur', tempInputBlurHandler)
    document.body.removeChild(tempInput)

    tempInput = null
}

const resize = (tempInput, rows) => {
    const width = Math.max(...rows.map((row) => canvasContext.measureText(row).width))
    const height = 20 * rows.length
    tempInput.style.width = `${Math.max(width, 20)}px`
    tempInput.style.height = `${Math.max(height, 20)}px`
    tempPoints[1] = [tempPoints[0][0] + width, tempPoints[0][1] + height]
}

let tempInputEditHandler
let tempInputBlurHandler

const editableText = (selectedElement) => {
    tempInput = document.createElement('textarea')
    tempInput.style.left = `${selectedElement.points[0][0] - canvas.parentNode.scrollLeft}px`
    tempInput.style.top = `${selectedElement.points[0][1] - canvas.parentNode.scrollTop}px`
    tempInput.classList.add('fakeInput')
    tempInput.value = selectedElement.text || ''
    document.body.appendChild(tempInput)
    tempInput.focus()
    let rows
    
    rows = splitOnRows(selectedElement.text || '', Infinity)
    resize(tempInput, rows)

    tempInputEditHandler = (event) => {
        if (selectedElement.type === 'text' || type === 'text') {
            redrawScreen()
            drawText(tempPoints, event.target.value, color)

            rows = splitOnRows(event.target.value, Infinity)
        } else if (selectedElement.type === 'sticker' || type === 'sticker') {
            redrawScreen()
            drawSticker(tempPoints, event.target.value, color)
            
            rows = splitOnRows(event.target.value, MAX_STICKER_WIDTH)
            event.target.value = rows.join('\n')
        }

        resize(tempInput, rows)
    }

    tempInputBlurHandler = () => {
        setTimeout(() => {
            stopTrackText(selectedElement)
        }, 300)
    }

    tempInput.addEventListener('input', tempInputEditHandler)
    tempInput.addEventListener('blur', tempInputBlurHandler)
}

const startTrackText = (event) => {
    if (['text', 'sticker'].includes(type) && !tempInput) {
        tempPoints = [getCoordinates(event), getCoordinates(event).map((i) => i + 20)]

        editableText({
            type,
            points: tempPoints
        })
    }
}

canvas.addEventListener('click', startTrackText)
