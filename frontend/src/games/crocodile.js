import { nodes, state } from '../state'
import { toggleTimerState } from '../timer'

import { showGameField, hideGameField, createGameButton } from './utils'

if (state.admin) {
    createGameButton('Games: Crocodile', () => {
        toggleTimerState(false)
        state.sendDataUpdate({
            action: 'start',
            type: 'game',
            name: 'crocodile',
        })
    })
}

export const startCrocodileGame = (secretWord) => {
    if (secretWord) {
        nodes.gameField.innerHTML = secretWord
        showGameField()

        setTimeout(() => {
            nodes.gameField.innerHTML = ''
            hideGameField()

            state.sendDataUpdate({
                action: 'stop',
                type: 'game',
                name: 'crocodile',
            })
        }, 10 * 1000)
    }
}
