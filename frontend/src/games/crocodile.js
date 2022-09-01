import { nodes, state } from '../state'
import { toggleTimerState } from '../timer'

import { showGameField, hideGameField, appendGameButton } from './utils'

appendGameButton('crocodile', () => {
    toggleTimerState(false)
})

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
