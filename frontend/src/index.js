import { trackContextMenu, withLongTouch } from './context-menu'
import {
    withDoubleClick,
    startTrackCursor,
    startTrackClick,
    startSelection,
    startMove,
} from './cursor'
import { dragCopy, dragDrop } from './drop'
import {
    changeSelectedType,
    changeSelectedColor,
    copyToClipboard,
    changeCustomColor,
    clickCustomColor,
} from './controls'
import { handleHotKeys } from './hotkeys'
import { openSocket } from './socket'
import { scaleOnWheel, scaleTouchStart, scaleTouchMove } from './scale'
import { toggleTimerState } from './timer'
import { startFigure } from './input-figures'
import { startTrackText } from './input-text'
import { state, nodes, roomId } from './state'
import { getCookie } from './get-cookie'
import './room.css'

state.choosenName = getCookie(`${roomId}:userName`)

if (!state.choosenName) {
    const setName = () => {
        state.choosenName = nodes.nameInput.value
        nodes.modal.classList.add('hidden')
        document.cookie = `${roomId}:userName=${state.choosenName}`
        openSocket()
    }
    const onKeySetName = (event) => {
        if (event.keyCode === 13 || event.keyCode === 27) {
            setName(event)
        }
    }

    nodes.modal.classList.remove('hidden')
    nodes.nameInput.value = `Guest${Math.floor(Math.random() * 100500)}`
    nodes.nameInput.focus()
    nodes.nameInput.setSelectionRange(0, nodes.nameInput.value.length)
    nodes.nameInput.addEventListener('keydown', onKeySetName)
    nodes.nameInput.addEventListener('blur', setName)
    nodes.nameEnter.addEventListener('click', setName)
    nodes.nameCancel.addEventListener('click', setName)
} else {
    openSocket()
}

nodes.roomLinkBtn.addEventListener('click', copyToClipboard)

nodes.canvasRoot.addEventListener('mousedown', startFigure)
nodes.canvasRoot.addEventListener('touchstart', startFigure)
nodes.canvasRoot.addEventListener('click', startTrackText)

document.querySelectorAll('[name=type]').forEach((control) => {
    control.addEventListener('click', (event) => {
        changeSelectedType(event.target.value)
    })
})

document.querySelectorAll('[name=color]').forEach((control) => {
    control.addEventListener('click', (event) => {
        changeSelectedColor(event.target.value)
    })
})
nodes.customColorSelector.addEventListener('change', changeCustomColor)
nodes.customColorSelector.addEventListener('click', clickCustomColor)

nodes.canvasRoot.addEventListener('mousemove', startTrackCursor)
nodes.canvasRoot.addEventListener('mousedown', withDoubleClick(startTrackClick, false))
nodes.canvasRoot.addEventListener('touchstart', withDoubleClick(startTrackClick, false))

nodes.canvasRoot.addEventListener('mousedown', withDoubleClick(startSelection, true))
nodes.canvasRoot.addEventListener('touchstart', withDoubleClick(startSelection, true))
nodes.canvasRoot.addEventListener('mousedown', withDoubleClick(startMove, false))
nodes.canvasRoot.addEventListener('touchstart', withDoubleClick(startMove, false))

nodes.canvasRoot.addEventListener('contextmenu', trackContextMenu)
nodes.canvasRoot.addEventListener('touchstart', withLongTouch(trackContextMenu))

nodes.canvasRoot.addEventListener('dragover', dragCopy)
nodes.canvasRoot.addEventListener('drop', dragDrop)

window.addEventListener('keydown', handleHotKeys)
nodes.canvasRoot.addEventListener('wheel', scaleOnWheel)
nodes.canvasRoot.addEventListener('touchstart', scaleTouchStart)
nodes.canvasRoot.addEventListener('touchmove', scaleTouchMove)

nodes.timerBtn.addEventListener('click', () => {
    toggleTimerState(true)
})
