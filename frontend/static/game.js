const gameBtn = document.getElementById('gameBtn')
const gameField = document.getElementById('gameField')

if (!admin) {
    gameBtn.classList.add('hidden')
}

gameBtn.addEventListener('click', () => {
    socket.send(JSON.stringify({ action: 'start', type: 'game' }))
    toggleTimerState(false)
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