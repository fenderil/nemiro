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
            color
        }))
    }

    tempPoints = []

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

const editableText = (selectedElement) => {
    tempInput = document.createElement('textarea')
    tempInput.style.left = `${selectedElement.points[0][0]}px`
    tempInput.style.top = `${selectedElement.points[0][1]}px`
    tempInput.classList.add('fakeInput')
    tempInput.value = selectedElement.text || ''
    document.body.appendChild(tempInput)
    tempInput.focus()
    let rows
    
    rows = splitOnRows(selectedElement.text || '', Infinity)
    resize(tempInput, rows)

    tempInput.addEventListener('input', (event) => {
        if (selectedElement.type === 'text' || type === 'text') {
            drawText(tempPoints, event.target.value, color)

            rows = splitOnRows(event.target.value, Infinity)
            const width = Math.max(...rows.map((row) => canvasContext.measureText(row).width))
        } else if (selectedElement.type === 'sticker' || type === 'sticker') {
            drawSticker(tempPoints, event.target.value, color)
            
            rows = splitOnRows(event.target.value, MAX_STICKER_WIDTH)
            event.target.value = rows.join('\n')
        }

        resize(tempInput, rows)
    })

    tempInput.addEventListener('blur', () => {
        setTimeout(() => {
            stopTrackText(selectedElement)
        }, 300)
    })
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
