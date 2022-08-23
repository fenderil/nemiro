const handleHotKeys = (event) => {
    if (event.code === 'KeyZ' && event.ctrlKey) {
        console.log('TODO: Revert')
    } else if ((event.code === 'KeyX' || event.code === 'KeyC') && event.ctrlKey && cursorHoveredElements.length) {
        clipboardElements = cursorHoveredElements
        if (event.code === 'KeyX') {
            cursorHoveredElements.forEach((element) => {
                sendDataUpdate({
                    id: element.id,
                    action: 'delete'
                })
            })
        }
    } else if (event.code === 'KeyV' && event.ctrlKey && clipboardElements.length) {
        clipboardElements.forEach((element) => {
            sendDataUpdate({
                ...element,
                points: element.points.map(([x, y]) => [x + 5, y + 5]),
                borders: element.points.map(([x, y]) => [x + 5, y + 5]),
                action: 'add'
            })
        })
    } else if (event.code === 'Backspace' || event.code === 'Delete' && cursorHoveredElements.length) {
        cursorHoveredElements.forEach((element) => {
            sendDataUpdate({
                id: element.id,
                action: 'delete'
            })
        })
    }
}

window.addEventListener('keydown', handleHotKeys)
