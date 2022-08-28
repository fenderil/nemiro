export const getCookie = (name) => {
    const matches = document.cookie.match(new RegExp(
        `(?:^|; )${name.replace(/([.$?*|{}()[]\\\/+^])/g, '\\$1')}=([^;]*)`,
    ))
    return matches ? decodeURIComponent(matches[1]) : undefined
}

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

export const MAX_STICKER_WIDTH = 160
export const scaleMin = 0.5
export const scaleMax = 4

export const protocol = window.location.protocol === 'http:' ? 'ws:' : 'wss:'
export const roomId = window.location.pathname.replace('/room/', '')

export const canvasContext = nodes.canvasRoot.getContext('2d')

canvasContext.font = '16px sans-serif'
canvasContext.textAlign = 'start'
canvasContext.textBaseline = 'top'

export const state = {
    choosenName: getCookie(`${roomId}:userName`)
        || window.prompt('Insert your name')
        || `Guest${Math.floor(Math.random() * 100500)}`,
    admin: getCookie(`${roomId}:admin`),
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
    selectedType: 'pointer',
    selectedColor: '#171717',
    currentScale: 1,
    clipboardElements: [],
    sapperField: [],
}

document.cookie = `${roomId}:userName=${state.choosenName}`
