import { CONTROL_TYPES } from './constants'
import { getCookie } from './get-cookie'

export const nodes = {
    usersRoot: document.getElementById('users'),
    canvasRoot: document.getElementById('canvas') || { getContext: () => ({}) },
    roomLinkBtn: document.getElementById('roomLink'),
    customColorSelector: document.getElementById('customColor'),
    customColorIndicator: document.getElementById('customColorIndicator'),
    contextMenu: document.getElementById('contextMenu'),
    editContext: document.getElementById('editContext'),
    deleteContext: document.getElementById('deleteContext'),
    crocodileBtn: document.getElementById('crocodileBtn'),
    sapperBtn: document.getElementById('sapperBtn'),
    gameField: document.getElementById('gameField'),
    timerBtn: document.getElementById('timerBtn'),
    timerOutput: document.getElementById('timer'),
    gamesButtons: document.getElementById('gamesButtons'),
    tempInputElement: document.getElementById('textarea'),
    modal: document.getElementById('modal'),
    nameInput: document.getElementById('nameInput'),
    nameEnter: document.getElementById('nameEnter'),
    nameCancel: document.getElementById('nameCancel'),
}

export const getNode = (node) => nodes[node]

export const protocol = window.location.protocol === 'http:' ? 'ws:' : 'wss:'
export const roomId = window.location.pathname.replace('/room/', '')

export const canvasContext = nodes.canvasRoot.getContext('2d')

canvasContext.font = '16px Tahoma'
canvasContext.textAlign = 'start'
canvasContext.textBaseline = 'top'

export const state = {
    // UserName on room enter
    choosenName: '',
    // Room admin
    admin: getCookie(`${roomId}:admin`),
    // Socket data callback
    sendDataUpdate: () => {},
    // Socket reconnection intervalId
    socketTimeoutId: null,
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
