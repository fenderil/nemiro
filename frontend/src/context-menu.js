import { nodes, state } from './state'
import { isEditableElement, getCoordinatesOnWindow, isPointer } from './utils'
import { editableText } from './input-text'

const trackLongTouch = () => {
    if (state.longTouchTimeoutId) {
        state.longTouch = false
        state.longTouchTimeoutId = null
    } else {
        state.longTouchTimeoutId = setTimeout(() => {
            state.longTouch = true
            state.longTouchTimeoutId = null
        }, 1000)
    }
}

const untrackLongTouch = () => {
    state.longTouch = false
    clearTimeout(state.longTouchTimeoutId)
}

export const withLongTouch = (cb, is) => (event) => {
    if (is) {
        setTimeout(cb, 1010, event)
    }
}

nodes.canvasRoot.addEventListener('touchstart', trackLongTouch)
nodes.canvasRoot.addEventListener('touchend', untrackLongTouch)

const hideContextMenu = () => {
    nodes.contextMenu.classList.add('hidden')
    nodes.editContext.classList.remove('hidden')
    nodes.editContext.removeEventListener('click', state.contextEditHandler)
    nodes.deleteContext.removeEventListener('click', state.contextDeleteHandler)
}

const showContextMenu = (event, contextElements) => {
    state.contextDeleteHandler = () => {
        contextElements.forEach((contextElement) => {
            state.sendDataUpdate({
                id: contextElement.id,
                action: 'delete',
            })
        })

        state.contextMenuOpened = false
        hideContextMenu()
        state.cursorSelectedElements = []
    }

    state.contextEditHandler = () => {
        if (isEditableElement(contextElements[0])) {
            state.workInProgressElement = contextElements[0]
            editableText(state.workInProgressElement)

            state.contextMenuOpened = false
            hideContextMenu()
        }
    }

    if (contextElements.length > 1 || !isEditableElement(contextElements[0])) {
        nodes.editContext.classList.add('hidden')
    } else {
        nodes.editContext.addEventListener('click', state.contextEditHandler)
    }

    nodes.deleteContext.addEventListener('click', state.contextDeleteHandler)
    const [left, top] = getCoordinatesOnWindow(event, 1)
    nodes.contextMenu.style.left = `${left}px`
    nodes.contextMenu.style.top = `${top}px`
    nodes.contextMenu.classList.remove('hidden')
}

export const trackContextMenu = (event) => {
    event.preventDefault()

    if (!state.contextMenuOpened && state.cursorSelectedElements.length && isPointer(state.selectedType)) {
        state.contextMenuOpened = true
        showContextMenu(event, state.cursorSelectedElements)
    } else {
        state.contextMenuOpened = false
        hideContextMenu()
    }
}
