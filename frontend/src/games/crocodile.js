import { nodes, state } from '../state'

export const startCrocodileGame = (secretWord) => {
    if (secretWord) {
        nodes.gameField.innerHTML = secretWord
        nodes.gameField.classList.remove('hidden')

        setTimeout(() => {
            nodes.gameField.innerHTML = ''
            nodes.gameField.classList.add('hidden')

            state.sendDataUpdate({
                action: 'stop',
                type: 'game',
                name: 'crocodile',
            })
        }, 10 * 1000)
    }
}
