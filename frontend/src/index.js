import { trackContextMenu, withLongTouch } from './context-menu'
import {
    withDoubleClick,
    startTrackHover,
    startTrackClick,
    startSelection,
    startMove,
    trackDoubleClick,
    untrackDoubleClick,
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
import { scaleOnWheel, scaleTouchStart, scaleTouchMove } from './scale'
import { toggleTimerState } from './timer'
import { startFigure } from './input-figures'
import { startTrackText } from './input-text'
import { state } from './state'
import { nodes } from './nodes'
import { getCookie } from './utils/get-cookie'
import { easterEgg } from './easter-egg'
import { regName } from './reg-name'
import './room.css'

easterEgg()

state.choosenName = getCookie(`${state.roomId}:userName`)

regName()

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

nodes.canvasRoot.addEventListener('mousedown', trackDoubleClick)
nodes.canvasRoot.addEventListener('touchstart', trackDoubleClick)
nodes.canvasRoot.addEventListener('mouseup', untrackDoubleClick)
nodes.canvasRoot.addEventListener('touchend', untrackDoubleClick)

nodes.canvasRoot.addEventListener('mousemove', startTrackHover)
nodes.canvasRoot.addEventListener('mousedown', withDoubleClick(startTrackClick, false))
nodes.canvasRoot.addEventListener('touchstart', withDoubleClick(startTrackClick, false))
nodes.canvasRoot.addEventListener('mousedown', withDoubleClick(startMove, false))
nodes.canvasRoot.addEventListener('touchstart', withDoubleClick(startMove, false))
nodes.canvasRoot.addEventListener('mousedown', withDoubleClick(startSelection, true))
nodes.canvasRoot.addEventListener('touchstart', withDoubleClick(startSelection, true))

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
