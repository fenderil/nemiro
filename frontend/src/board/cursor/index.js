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
            nodes.canvasRoot.addEventListener('mousemove', trackResizeElements)
            nodes.canvasRoot.addEventListener('mouseup', stopResizeElements)
            nodes.canvasRoot.addEventListener('touchmove', trackResizeElements)
            nodes.canvasRoot.addEventListener('touchend', stopResizeElements)
        } else if (state.cursorSelectedElements.length) {
            state.pointerCaptureCoordinates = getCoordinates(event)
            nodes.canvasRoot.addEventListener('mousemove', trackMoveElements)
            nodes.canvasRoot.addEventListener('mouseup', stopMoveElements)
            nodes.canvasRoot.addEventListener('touchmove', trackMoveElements)
            nodes.canvasRoot.addEventListener('touchend', stopMoveElements)
        } else {
            state.pointerCaptureCoordinates = getCoordinates(event, 1, 1)
            nodes.canvasRoot.addEventListener('mousemove', trackMoveCanvas)
            nodes.canvasRoot.addEventListener('mouseup', stopMoveCanvas)
            nodes.canvasRoot.addEventListener('touchmove', trackMoveCanvas)
            nodes.canvasRoot.addEventListener('touchend', stopMoveCanvas)
        }
    }
}

export const startSelection = (event) => {
    if (isPointer(state.selectedType)) {
        state.pointerCaptureCoordinates = getCoordinates(event)
        nodes.canvasRoot.addEventListener('mousemove', trackSelectFrame)
        nodes.canvasRoot.addEventListener('mouseup', stopSelectFrame)
    }
}
