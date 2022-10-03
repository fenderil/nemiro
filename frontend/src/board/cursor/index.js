import { state } from '../../data/state'
import { nodes } from '../../data/nodes'
import { isPointer } from '../../utils/types'
import { getCoordinates } from '../../utils/coords'

import { trackResizeElements, stopResizeElements } from './resize-elements'
import { trackMoveElements, stopMoveElements } from './move-elements'
import { trackMoveCanvas, stopMoveCanvas } from './move-canvas'
import { trackSelectFrame, stopSelectFrame } from './selection-frame'

export { startTrackClick } from './click'
export { startTrackHover } from './hover'

export const trackDoubleClick = () => {
    if (state.doubleClickTimeoutId) {
        clearTimeout(state.doubleClickTimeoutId)
        state.doubleClick = true
        state.doubleClickTimeoutId = null
    } else {
        state.doubleClickTimeoutId = setTimeout(() => {
            state.doubleClick = false
            state.doubleClickTimeoutId = null
        }, 300)
    }
}

export const untrackDoubleClick = () => {
    state.doubleClick = false
}

export const withDoubleClick = (cb, is) => (event) => {
    if ((is && state.doubleClick) || (!is && !state.doubleClick)) {
        cb(event)
    }
}

export const startMove = (event) => {
    if (isPointer(state.selectedType)) {
        if (state.cursorSelectedControlPoint) {
            state.pointerCaptureCoordinates = getCoordinates(event)
            nodes.canvas.addEventListener('mousemove', trackResizeElements)
            nodes.canvas.addEventListener('mouseup', stopResizeElements)
            nodes.canvas.addEventListener('touchmove', trackResizeElements)
            nodes.canvas.addEventListener('touchend', stopResizeElements)
        } else if (state.cursorSelectedElements.length) {
            state.pointerCaptureCoordinates = getCoordinates(event)
            nodes.canvas.addEventListener('mousemove', trackMoveElements)
            nodes.canvas.addEventListener('mouseup', stopMoveElements)
            nodes.canvas.addEventListener('touchmove', trackMoveElements)
            nodes.canvas.addEventListener('touchend', stopMoveElements)
        } else {
            state.pointerCaptureCoordinates = getCoordinates(event, 1, 1)
            nodes.canvas.addEventListener('mousemove', trackMoveCanvas)
            nodes.canvas.addEventListener('mouseup', stopMoveCanvas)
            nodes.canvas.addEventListener('touchmove', trackMoveCanvas)
            nodes.canvas.addEventListener('touchend', stopMoveCanvas)
        }
    }
}

export const startSelection = (event) => {
    if (isPointer(state.selectedType)) {
        state.pointerCaptureCoordinates = getCoordinates(event)
        nodes.canvas.addEventListener('mousemove', trackSelectFrame)
        nodes.canvas.addEventListener('mouseup', stopSelectFrame)
    }
}
