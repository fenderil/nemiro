import { nodes } from '../state'

export const createGameButton = (title, handler) => {
    const button = document.createElement('button')
    button.type = 'button'
    button.classList.add('userBtn')
    button.innerText = title
    button.addEventListener('click', handler)
    nodes.gamesButtons.appendChild(button)
}
