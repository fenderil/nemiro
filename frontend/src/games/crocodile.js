import { DATA_ACTIONS, DATA_TYPES } from '../constants'
import { state } from '../state'
import { nodes } from '../nodes'
import { toggleTimerState } from '../timer'

import { showGameField, hideGameField, appendGameButton } from './utils'

appendGameButton('crocodile', () => {
    toggleTimerState(false)
})

export const crocodile = (secretWord) => {
    if (secretWord) {
        nodes.gameField.innerHTML = secretWord
        showGameField()

        setTimeout(() => {
            nodes.gameField.innerHTML = ''
            hideGameField()

            state.sendDataUpdate({
                action: DATA_ACTIONS.stop,
                type: DATA_TYPES.game,
                name: 'crocodile',
            })
        }, 10 * 1000)
    }
}
