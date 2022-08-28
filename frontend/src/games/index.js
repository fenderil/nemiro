import { startCrocodileGame } from './crocodile'
import { startSapperGame, tickSapperGame, stopSapperGame } from './sapper'

export const games = (data) => {
    if (data.games.crocodile) {
        startCrocodileGame(data.games.crocodile)
    }

    if (data.games.sapper && data.games.sapper.action === 'start') {
        startSapperGame(data.games.sapper)
    }

    if (data.games.sapper) {
        tickSapperGame(data.games.sapper)
    }

    if (data.games.sapper && data.games.sapper.action === 'stop') {
        stopSapperGame(data.games.sapper)
    }
}
