import { state } from './state'

const removeElementsAndReset = () => {
    state.cursorSelectedElements.forEach((element) => {
        state.sendDataUpdate({
            id: element.id,
            action: 'delete',
        })
    })
    state.cursorSelectedElements = []
    state.cursorSelectedControlPoint = null
    state.cursorFixedControlPoint = null
    state.workInProgressElement = null
    state.selectionFramePoints = null
    state.pointerCaptureCoordinates = null
}

export const handleHotKeys = (event) => {
    if (!state.workInProgressElement) {
        if (event.code === 'KeyZ' && event.ctrlKey) {
            // TODO: Revert
        } else if ((event.code === 'KeyX' || event.code === 'KeyC') && event.ctrlKey && state.cursorSelectedElements.length) {
            state.clipboardElements = state.cursorSelectedElements
            if (event.code === 'KeyX') {
                removeElementsAndReset()
            }
        } else if (event.code === 'KeyV' && event.ctrlKey && state.clipboardElements.length) {
            state.clipboardElements.forEach((element) => {
                state.sendDataUpdate({
                    ...element,
                    points: element.points.map(([x, y]) => [x + 5, y + 5]),
                    borders: element.points.map(([x, y]) => [x + 5, y + 5]),
                    action: 'add',
                })
            })
        } else if ((event.code === 'Backspace' || event.code === 'Delete') && state.cursorSelectedElements.length) {
            removeElementsAndReset()
        }
    }
}
