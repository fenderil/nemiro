import { DATA_ACTIONS, DATA_TYPES } from '../../data/constants'
import { state } from '../../data/state'
import { nodes } from '../../data/nodes'
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
