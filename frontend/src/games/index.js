import { crocodile } from './crocodile'
import { sapper } from './sapper'
import { tron } from './tron'
import './games.css'

export const games = (data) => {
    if (data.games.crocodile) {
        crocodile(data.games.crocodile)
    }

    if (data.games.sapper) {
        sapper(data.games.sapper)
    }

    if (data.games.tron) {
        tron(data.games.tron)
    }
}
