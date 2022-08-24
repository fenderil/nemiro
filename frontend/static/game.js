if (!admin) {
    crocodileBtn.classList.add('hidden')
    sapperBtn.classList.add('hidden')
}

crocodileBtn.addEventListener('click', () => {
    sendDataUpdate({ action: 'start', type: 'game' })
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
            gameField.innerHTML = ''
            gameField.classList.add('hidden')
            gameField.classList.remove('gameFieldActive')
        }, 10 * 1000)
    }
}

sapperBtn.addEventListener('click', () => {
    sendDataUpdate({ action: 'start', type: 'sapperGame' })
})

const SAPPER_COLORS = [
    'transparent',
    'blue',
    'green',
    'yellow',
    'orange',
    'red',
    'red',
    'darkred',
    'darkred'
]

const redrawField = (data) => {
    // TODO: removeChild
    gameField.innerHTML = ''
    for (let i = 0; i < data.sapper.width; i += 1) {
        const row = document.createElement('div')

        for (let j = 0; j < data.sapper.height; j += 1) {
            const btn = document.createElement('button')
            btn.type = 'button'
            btn.title = data.sapper.field[i][j]
            btn.classList.add('sapperBtn')

            if (typeof data.sapper.field[i][j] === 'number') {
                btn.innerHTML = data.sapper.field[i][j]
                btn.disabled = true
                btn.classList.add('sapperOpened')
                btn.style.color = SAPPER_COLORS[data.sapper.field[i][j]]
            } else if (data.sapper.field[i][j] === 'dead') {
                btn.innerHTML = 'x'
                btn.classList.add('sapperBomb')
                btn.disabled = true
            } else {
                btn.addEventListener('mousedown', (event) => {
                    event.preventDefault()
                    sendDataUpdate({ action: 'edit', type: 'sapperGame', status: 'opened', sector: [i, j] })
                })

                // btn.addEventListener('contextmenu', (event) => {
                //     event.preventDefault()
                //     sendDataUpdate({ action: 'edit', type: 'sapperGame', sector: [i, j], status: 'flagged' })
                // })
            }

            row.appendChild(btn)
        }

        gameField.appendChild(row)
    }
}

const tickSapperGame = (data) => {
    gameField.classList.remove('hidden')
    redrawField(data)
}

const stopSapperGame = () => {
    // TODO: with reload
}
