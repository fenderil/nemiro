import { startCrocodileGame } from './crocodile'
import { startSapperGame, tickSapperGame, stopSapperGame } from './sapper'
import { startTronGame, tickTronGame, stopTronGame } from './tron'
import './games.css'

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

    if (data.games.tron && data.games.tron.action === 'start') {
        startTronGame(data.games.tron)
    }

    if (data.games.tron) {
        tickTronGame(data.games.tron)
    }

    if (data.games.tron && data.games.tron.action === 'stop') {
        stopTronGame(data.games.tron)
    }
}
