const removeElementsAndReset = () => {
    cursorSelectedElements.forEach((element) => {
        sendDataUpdate({
            id: element.id,
            action: 'delete',
        })
    })
    cursorSelectedElements = []
    cursorSelectedControlPoint = null
    cursorFixedControlPoint = null
    workInProgressElement = null
    selectionFramePoints = null
    pointerCaptureCoordinates = null
}

const handleHotKeys = (event) => {
    if (event.code === 'KeyZ' && event.ctrlKey) {
        // TODO: Revert
    } else if ((event.code === 'KeyX' || event.code === 'KeyC') && event.ctrlKey && cursorSelectedElements.length) {
        clipboardElements = cursorSelectedElements
        if (event.code === 'KeyX') {
            removeElementsAndReset()
        }
    } else if (event.code === 'KeyV' && event.ctrlKey && clipboardElements.length) {
        clipboardElements.forEach((element) => {
            sendDataUpdate({
                ...element,
                points: element.points.map(([x, y]) => [x + 5, y + 5]),
                borders: element.points.map(([x, y]) => [x + 5, y + 5]),
                action: 'add',
            })
        })
    } else if ((event.code === 'Backspace' || event.code === 'Delete') && cursorSelectedElements.length) {
        removeElementsAndReset()
    }
}

window.addEventListener('keydown', handleHotKeys)
