import { DATA_ACTIONS } from './constants'
import { state } from './state'
import { shiftPoint } from './utils/points'

const removeElementsAndReset = () => {
    state.cursorSelectedElements.forEach((element) => {
        state.sendDataUpdate({
            id: element.id,
            action: DATA_ACTIONS.delete,
        })
    })
    state.cursorSelectedElements = []
    state.cursorSelectedControlPoint = null
    state.cursorFixedControlPoint = null
    state.workInProgressElements = []
    state.selectionFramePoints = null
    state.pointerCaptureCoordinates = null
}

export const handleHotKeys = (event) => {
    if (!state.workInProgressElements.length) {
        if (event.code === 'KeyZ' && (event.ctrlKey || event.metaKey)) {
            // TODO: Revert
        } else if ((event.code === 'KeyX' || event.code === 'KeyC')
            && (event.ctrlKey || event.metaKey)
            && state.cursorSelectedElements.length) {
            state.clipboardElements = state.cursorSelectedElements
            if (event.code === 'KeyX') {
                removeElementsAndReset()
            }
        } else if (event.code === 'KeyV'
            && (event.ctrlKey || event.metaKey)
            && state.clipboardElements.length) {
            state.clipboardElements.forEach((element) => {
                state.sendDataUpdate({
                    ...element,
                    points: element.points.map((point) => shiftPoint(point, -4)),
                    borders: element.points.map((point) => shiftPoint(point, 4)),
                    action: DATA_ACTIONS.add,
                })
            })
        } else if ((event.code === 'Backspace' || event.code === 'Delete')
            && state.cursorSelectedElements.length) {
            removeElementsAndReset()
        }
    }
}
