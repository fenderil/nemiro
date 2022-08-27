const MAX_STICKER_WIDTH = 160
const scaleMin = 0.5
const scaleMax = 4

const protocol = window.location.protocol === 'http:' ? 'ws:' : 'wss:'
const roomId = window.location.pathname.replace('/room/', '')

const usersRoot = document.getElementById('users')
const canvasRoot = document.getElementById('canvas')
const customColorSelector = document.getElementById('customColor')
const customColorIndicator = document.getElementById('customColorIndicator')
const contextMenu = document.getElementById('contextMenu')
const editContext = document.getElementById('editContext')
const deleteContext = document.getElementById('deleteContext')
const crocodileBtn = document.getElementById('crocodileBtn')
const sapperBtn = document.getElementById('sapperBtn')
const gameField = document.getElementById('gameField')
const timerBtn = document.getElementById('timerBtn')
const timerOutput = document.getElementById('timer')

const canvasContext = canvasRoot.getContext('2d')

canvasContext.font = '16px sans-serif'
canvasContext.textAlign = 'start'
canvasContext.textBaseline = 'top'

customColorIndicator.style.borderColor = customColorSelector.value

const sendDataUpdate = () => {}

const socketTimeoutId = null
const savedElements = []
const savedUsers = []
const timerCounter = 0
const timerTimoutId = null

const tempInputElement = null
let tempInputEditHandler
let tempInputBlurHandler

const pointerCaptureCoordinates = null
const doubleClick = false
const doubleClickTimeoutId = null
const longTouch = false
const longTouchTimeoutId = null

let contextEditHandler
let contextDeleteHandler
const contextMenuOpened = false

const cursorHoveredElements = []
const cursorSelectedElements = []
const cursorSelectedControlPoint = null
const cursorFixedControlPoint = null
const workInProgressElement = null
const selectionFramePoints = null

const imageSize = null

const selectedType = 'pointer'
const selectedColor = '#171717'

const currentScale = 1

const clipboardElements = []

const sapperField = []
