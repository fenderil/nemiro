import { state } from '../state'
import { toggleTimerState } from '../timer'

import { startCrocodileGame } from './crocodile'
import { startSapperGame, tickSapperGame, stopSapperGame } from './sapper'

import { createGameButton } from './utils'

if (state.admin) {
    createGameButton('Games: Crocodile', () => {
        toggleTimerState(false)
        state.sendDataUpdate({
            action: 'start',
            type: 'game',
            name: 'crocodile',
        })
    })
    createGameButton('Games: Sapper', () => {
        state.sendDataUpdate({
            action: 'start',
            type: 'game',
            name: 'sapper',
        })
    })
}

export const games = (data) => {
    if (data.games.crocodile) {
        startCrocodileGame(data.games.crocodile)
    }

    if (data.games.sapper && data.games.sapper.action === 'start') {
        startSapperGame()
    }

    if (data.games.sapper) {
        tickSapperGame(data.games.sapper)
    }

    if (data.games.sapper && data.games.sapper.action === 'stop') {
        stopSapperGame(data.games.sapper)
    }
}
