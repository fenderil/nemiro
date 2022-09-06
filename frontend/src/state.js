import { CONTROL_TYPES } from './constants'
import { getCookie } from './utils/get-cookie'
import { nodes } from './nodes'

const canvasContext = nodes.canvasRoot.getContext('2d')
canvasContext.font = '16px Tahoma'
canvasContext.textAlign = 'start'
canvasContext.textBaseline = 'top'
const roomId = window.location.pathname.replace('/room/', '')

export const state = {
    // UserName on room enter
    choosenName: '',
    // Room id
    roomId,
    // Room admin
    admin: getCookie(`${roomId}:admin`),
    // Canvas Context
    canvasContext,
    // Socket data callback
    sendDataUpdate: () => {},
    // Elements on board
    savedElements: [],
    // UserNames for cursors and online
    savedUsers: [],
    // Timer widget counter
    timerCounter: 0,
    // Timer closing timoutId
    timerTimoutId: null,
    // Temp input for text elements handlers
    tempInputEditHandler: () => {},
    tempInputBlurHandler: () => {},
    // Pointer start action coordinates
    pointerCaptureCoordinates: null,
    // Double click momentum state
    doubleClick: false,
    // Double click momentum timoutId
    doubleClickTimeoutId: null,
    // Long touch momentum state
    longTouch: false,
    // Long touch momentum timoutId
    longTouchTimeoutId: null,
    // Context menu handlers
    contextEditHandler: () => {},
    contextDeleteHandler: () => {},
    // Context menu state
    contextMenuOpened: false,
    // Elements on board :edit
    workInProgressElements: [],
    // Elements on board :hover
    cursorHoveredElements: [],
    // Elements on board :focus
    cursorSelectedElements: [],
    // Elements ready to be pasted
    clipboardElements: [],
    // Element control point for changes
    cursorSelectedControlPoint: null,
    // Element basis control point
    cursorFixedControlPoint: null,
    // Selection frame from to
    selectionFramePoints: null,
    // Size of loaded image
    imageSize: null,
    // Selected control type
    selectedType: CONTROL_TYPES.pointer,
    // Selected control color
    selectedColor: '#171717',
    // Scale value
    currentScale: 1,
}

export const getState = (key) => state[key]
export const setState = (key, value) => {
    state[key] = value
}
