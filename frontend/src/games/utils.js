import { nodes, state } from '../state'

export const createGameButton = (title, handler) => {
    const button = document.createElement('button')
    button.type = 'button'
    button.classList.add('userBtn')
    button.innerText = title
    button.addEventListener('click', handler)
    nodes.gamesButtons.appendChild(button)
}

export const appendGameButton = (name, additionalCallback = () => {}) => {
    if (state.admin) {
        createGameButton(`Games: ${name}`, () => {
            additionalCallback()

            state.sendDataUpdate({
                action: 'start',
                type: 'game',
                name,
            })
        })
    }
}

export const showGameField = () => {
    nodes.gameField.classList.remove('hidden')
}

export const hideGameField = () => {
    nodes.gameField.classList.add('hidden')
}


const DEAD_EMOJIES = ['💀', '☠️', '👻', '⚰️', '💩', '😭', '💔']
const FLAG_EMOJIES = ['🚩', '🔺', '📛', '💣', '🧨', '🖕', '⚒️']
const ALIVE_EMOJIES = ['👶', '👴🏻', '👳🏻', '❤️', '🤗', '😁', '😏', '😎']
const emojies = {
    dead: DEAD_EMOJIES[0],
    flag: FLAG_EMOJIES[0],
    alive: ALIVE_EMOJIES[0],
}
export const setEmojies = () => {
    emojies.dead = DEAD_EMOJIES[Math.floor(Math.random() * DEAD_EMOJIES.length)]
    emojies.flag = FLAG_EMOJIES[Math.floor(Math.random() * FLAG_EMOJIES.length)]
    emojies.alive = ALIVE_EMOJIES[Math.floor(Math.random() * ALIVE_EMOJIES.length)]

    return emojies
}

export const getEmojies = (key) => emojies[key]

export const appendCloseButton = (name) => {
    const closeBtn = document.createElement('button')
    closeBtn.type = 'button'
    closeBtn.innerHTML = 'Close'
    closeBtn.classList.add('userBtn')
    closeBtn.classList.add('closeBtn')

    closeBtn.addEventListener('click', () => {
        nodes.gameField.innerHTML = ''

        hideGameField()

        state.sendDataUpdate({
            type: 'game',
            name,
            action: 'stop',
        })
    })

    nodes.gameField.appendChild(closeBtn)
}
