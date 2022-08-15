const stopTrackText = (element) => {
    networkChannel.send(JSON.stringify({
        ...element,
        action: element.id ? 'edit' : 'add'
    }))

    tempInputElement.removeEventListener('input', tempInputEditHandler)
    canvasRoot.removeEventListener('click', tempInputBlurHandler)
    document.body.removeChild(tempInputElement)

    workInProgressElement = null
}

const resize = (input, rows) => {
    const width = Math.max(...rows.map((row) => canvasContext.measureText(row).width))
    const height = 20 * rows.length
    input.style.width = `${Math.max(width, 20)}px`
    input.style.height = `${Math.max(height, 20)}px`
    workInProgressElement.points[1] = [workInProgressElement.points[0][0] + width, workInProgressElement.points[0][1] + height]
}

const editableText = (element) => {
    tempInputElement = document.createElement('textarea')
    tempInputElement.style.left = `${element.points[0][0] - canvas.parentNode.scrollLeft}px`
    tempInputElement.style.top = `${element.points[0][1] - canvas.parentNode.scrollTop}px`
    tempInputElement.classList.add('fakeInput')
    tempInputElement.value = element.text || ''
    document.body.appendChild(tempInputElement)
    tempInputElement.focus()
    let rows
    
    rows = splitOnRows(element.text || '', Infinity)
    resize(tempInputElement, rows)

    tempInputEditHandler = (event) => {
        if (element.type === 'text') {
            element.text = event.target.value
            rows = splitOnRows(event.target.value, Infinity)
        } else if (element.type === 'sticker') {
            element.text = event.target.value
            rows = splitOnRows(event.target.value, MAX_STICKER_WIDTH)
            event.target.value = rows.join('\n')
        }

        resize(tempInputElement, rows)
        redrawScreen()
    }

    tempInputBlurHandler = () => {
        stopTrackText(element)
    }

    tempInputElement.addEventListener('input', tempInputEditHandler)
    canvasRoot.addEventListener('click', tempInputBlurHandler)
}

const startTrackText = (event) => {
    if (['text', 'sticker'].includes(selectedType) && !workInProgressElement) {
        workInProgressElement = {
            points: [getCoordinates(event), getCoordinates(event).map((i) => i + 20)],
            type: selectedType,
            color: selectedColor,
            text: ''
        }

        editableText(workInProgressElement)
    }
}

canvas.addEventListener('click', startTrackText)
