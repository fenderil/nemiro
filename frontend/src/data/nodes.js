export const nodes = {
    usersRoot: document.getElementById('users'),
    canvasRoot: document.getElementById('canvas'),
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
