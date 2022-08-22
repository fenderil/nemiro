const stopTrackText = (element) => {
    networkChannel.send(JSON.stringify({
        ...element,
        action: element.id ? 'edit' : 'add'
    }))

    tempInputElement.removeEventListener('input', tempInputEditHandler)
    canvasRoot.removeEventListener('click', tempInputBlurHandler)
    tempInputElement.classList.add('hidden')

    workInProgressElement = null
}

const resize = (input, rows) => {
    const width = Math.max(Math.max(...rows.map((row) => canvasContext.measureText(row).width)), 20)
    const height = Math.max(20 * rows.length, 20)
    input.style.width = `${width}px`
    input.style.height = `${height}px`
    workInProgressElement.points[1] = [workInProgressElement.points[0][0] + width, workInProgressElement.points[0][1] + height]
}

const editableText = (element) => {
    tempInputElement = document.getElementById('textarea')
    tempInputElement.style.left = `${element.points[0][0] - canvas.parentNode.scrollLeft}px`
    tempInputElement.style.top = `${element.points[0][1] - canvas.parentNode.scrollTop}px`
    tempInputElement.classList.remove('hidden')
    tempInputElement.value = element.text || ''
    tempInputElement.focus()

    let lines = createMultilineText(element.text || '', Infinity).split(/[\r\n]/)
    resize(tempInputElement, lines)
    redrawScreen()

    // TODO: remember all \r for correct message sending
    tempInputEditHandler = (event) => {
        if (element.type === 'text') {
            element.text = event.target.value
            lines = createMultilineText(event.target.value, Infinity).split(/[\r\n]/)
        } else if (element.type === 'sticker') {
            element.text = event.target.value
            lines = createMultilineText(event.target.value, MAX_STICKER_WIDTH).split(/[\r\n]/)
            event.target.value = lines.join('\n')
        }

        resize(tempInputElement, lines)
        redrawScreen()
    }

    tempInputBlurHandler = () => {
        stopTrackText(element)
        changeSelectedType('pointer')
        document.querySelector('[name=type][value=pointer]').checked = true
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
