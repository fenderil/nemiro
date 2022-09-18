import { state } from '../../data/state'
import { nodes } from '../../data/nodes'
import { getCoordinatesOnWindow } from '../../utils/coords'
import { isEditableElement, isPointer } from '../../utils/types'
import { editableText } from '../../board/input-text'
import './style.css'
import { DATA_ACTIONS } from '../../data/constants'

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

const findUpper = (from, expected) => {
    let parentNode = from
    while (parentNode) {
        if (parentNode === expected) {
            return parentNode
        }

        parentNode = parentNode.parentNode
    }

    return null
}

const trackCloseContextMenu = (event) => {
    const parentNode = findUpper(event.target, nodes.contextMenu)

    if (!parentNode && !nodes.contextMenu.classList.contains('hidden')) {
        hideContextMenu()
    }
}

const hideContextMenu = () => {
    nodes.contextMenu.classList.add('hidden')
    nodes.editContext.classList.remove('hidden')
    nodes.likeContext.classList.remove('hidden')
    nodes.dislikeContext.classList.remove('hidden')

    state.contextMenuOpened = false
    window.removeEventListener('click', trackCloseContextMenu)
}

const contextEditHandler = () => {
    if (isEditableElement(state.cursorSelectedElements[0])) {
        state.workInProgressElements = [state.cursorSelectedElements[0]]
        editableText(state.workInProgressElements[0])
        hideContextMenu()
    }
}
const contextDeleteHandler = () => {
    state.cursorSelectedElements.forEach((contextElement) => {
        state.sendDataUpdate({
            id: contextElement.id,
            action: DATA_ACTIONS.delete,
        })
    })

    hideContextMenu()
    state.cursorSelectedElements = []
}
const contextLikeHandler = () => {
    state.cursorSelectedElements.forEach((contextElement) => {
        state.sendDataUpdate({
            id: contextElement.id,
            action: DATA_ACTIONS.like,
        })
    })
}
const contextDislikeHandler = () => {
    state.cursorSelectedElements.forEach((contextElement) => {
        state.sendDataUpdate({
            id: contextElement.id,
            action: DATA_ACTIONS.dislike,
        })
    })
}

nodes.editContext.addEventListener('click', contextEditHandler)
nodes.deleteContext.addEventListener('click', contextDeleteHandler)
nodes.likeContext.addEventListener('click', contextLikeHandler)
nodes.dislikeContext.addEventListener('click', contextDislikeHandler)

const showContextMenu = (event) => {
    if (state.cursorSelectedElements.length > 1
        || !isEditableElement(state.cursorSelectedElements[0])) {
        nodes.editContext.classList.add('hidden')
        nodes.likeContext.classList.add('hidden')
        nodes.dislikeContext.classList.add('hidden')
    }

    const [left, top] = getCoordinatesOnWindow(event, 1)
    nodes.contextMenu.style.left = `${left}px`
    nodes.contextMenu.style.top = `${top}px`
    nodes.contextMenu.classList.remove('hidden')
}

export const trackContextMenu = (event) => {
    event.preventDefault()

    if (!state.contextMenuOpened
        && state.cursorSelectedElements.length
        && isPointer(state.selectedType)) {
        state.contextMenuOpened = true
        showContextMenu(event)

        window.addEventListener('click', trackCloseContextMenu)
    }
}
