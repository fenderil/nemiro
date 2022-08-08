const gameBtn = document.getElementById('gameBtn')
const gameField = document.getElementById('gameField')

gameBtn.addEventListener('click', () => {
    socket.send(JSON.stringify({ action: 'start', type: 'game' }))
})

const startGame = (secretWord) => {
    if (secretWord) {
        gameField.innerHTML = secretWord
        gameField.classList.remove('hidden')

        setTimeout(() => {
            gameField.classList.add('gameFieldActive')
        }, 100)

        setTimeout(() => {
            gameField.classList.add('hidden')
            gameField.classList.remove('gameFieldActive')
        }, 10 * 1000)
    }
}