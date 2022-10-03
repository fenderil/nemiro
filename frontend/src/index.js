import { trackContextMenu, withLongTouch } from './interface/context-menu'
import {
    withDoubleClick,
    startTrackHover,
    startTrackClick,
    startSelection,
    startMove,
    trackDoubleClick,
    untrackDoubleClick,
} from './board/cursor'
import { dragCopy, dragDrop } from './board/drop'
import {
    changeSelectedType,
    changeSelectedColor,
    copyToClipboard,
    changeCustomColor,
    clickCustomColor,
} from './interface/controls'
import { handleHotKeys } from './board/hotkeys'
import { scaleOnWheel, scaleTouchStart, scaleTouchMove } from './interface/scale'
import { toggleTimerState } from './interface/timer'
import { startFigure } from './board/input-figures'
import { startTrackText } from './board/input-text'
import { state } from './data/state'
import { nodes } from './data/nodes'
import { getCookie } from './utils/get-cookie'
import { easterEgg } from './interface/easter-egg'
import { regName } from './interface/reg-name'
import './style.css'

easterEgg()

state.userName = getCookie(`${state.roomId}:userName`)

regName()

nodes.roomLink.addEventListener('click', copyToClipboard)

nodes.canvas.addEventListener('mousedown', startFigure)
nodes.canvas.addEventListener('touchstart', startFigure)
nodes.canvas.addEventListener('click', startTrackText)

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

nodes.canvas.addEventListener('mousedown', trackDoubleClick)
nodes.canvas.addEventListener('touchstart', trackDoubleClick)
nodes.canvas.addEventListener('mouseup', untrackDoubleClick)
nodes.canvas.addEventListener('touchend', untrackDoubleClick)

nodes.canvas.addEventListener('mousemove', startTrackHover)
nodes.canvas.addEventListener('mousedown', withDoubleClick(startTrackClick, false))
nodes.canvas.addEventListener('touchstart', withDoubleClick(startTrackClick, false))
nodes.canvas.addEventListener('mousedown', withDoubleClick(startMove, false))
nodes.canvas.addEventListener('touchstart', withDoubleClick(startMove, false))
nodes.canvas.addEventListener('mousedown', withDoubleClick(startSelection, true))
nodes.canvas.addEventListener('touchstart', withDoubleClick(startSelection, true))

nodes.canvas.addEventListener('contextmenu', trackContextMenu)
nodes.canvas.addEventListener('touchstart', withLongTouch(trackContextMenu))

nodes.canvas.addEventListener('dragover', dragCopy)
nodes.canvas.addEventListener('drop', dragDrop)

window.addEventListener('keydown', handleHotKeys)
nodes.canvas.addEventListener('wheel', scaleOnWheel)
nodes.canvas.addEventListener('touchstart', scaleTouchStart)
nodes.canvas.addEventListener('touchmove', scaleTouchMove)

nodes.timerBtn.addEventListener('click', () => {
    toggleTimerState(true)
})
