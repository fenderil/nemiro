import { CONTROL_TYPES } from './constants'

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
}

export const getNode = (node) => nodes[node]

export const protocol = window.location.protocol === 'http:' ? 'ws:' : 'wss:'
export const roomId = window.location.pathname.replace('/room/', '')

export const canvasContext = nodes.canvasRoot.getContext('2d')

canvasContext.font = '16px Tahoma'
canvasContext.textAlign = 'start'
canvasContext.textBaseline = 'top'

export const state = {
    choosenName: '',
    admin: false,
    sendDataUpdate: () => {},
    socketTimeoutId: null,
    savedElements: [],
    savedUsers: [],
    timerCounter: 0,
    timerTimoutId: null,
    tempInputEditHandler: () => {},
    tempInputBlurHandler: () => {},
    pointerCaptureCoordinates: null,
    doubleClick: false,
    doubleClickTimeoutId: null,
    longTouch: false,
    longTouchTimeoutId: null,
    contextEditHandler: () => {},
    contextDeleteHandler: () => {},
    contextMenuOpened: false,
    cursorHoveredElements: [],
    cursorSelectedElements: [],
    cursorSelectedControlPoint: null,
    cursorFixedControlPoint: null,
    workInProgressElement: null,
    selectionFramePoints: null,
    imageSize: null,
    selectedType: CONTROL_TYPES.pointer,
    selectedColor: '#171717',
    currentScale: 1,
    clipboardElements: [],
    sapperField: [],
}

export const getState = (key) => state[key]
export const setState = (key, value) => {
    state[key] = value
}
