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
            gameField.innerHTML = ''
            gameField.classList.add('hidden')
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
    const ownPlayerMeta = data.sapper.players.find(({ name }) => name === choosenName)
    
    const field = document.createElement('div')

    if (!ownPlayerMeta.dead) {
        field.addEventListener('click', (event) => {
            const x = [...event.target.parentNode.parentNode.childNodes].indexOf(event.target.parentNode)
            const y = [...event.target.parentNode.childNodes].indexOf(event.target)
            event.preventDefault()
            sendDataUpdate({ action: 'edit', type: 'sapperGame', status: 'opened', sector: [x, y] })
        })

        field.addEventListener('contextmenu', (event) => {
            const x = [...event.target.parentNode.parentNode.childNodes].indexOf(event.target.parentNode)
            const y = [...event.target.parentNode.childNodes].indexOf(event.target)
            event.preventDefault()
            sendDataUpdate({ action: 'edit', type: 'sapperGame', status: 'flagged', sector: [x, y] })
        })
    }

    for (let i = 0; i < data.sapper.width; i += 1) {
        const row = document.createElement('div')
        row.classList.add('sapperRow')

        for (let j = 0; j < data.sapper.height; j += 1) {
            const btn = document.createElement('button')
            btn.type = 'button'
            btn.title = data.sapper.field[i][j]
            btn.classList.add('sapperBtn')

            if (/^\d:/.test(data.sapper.field[i][j])) {
                const [rate, name] = data.sapper.field[i][j].split(':')
                btn.innerHTML = rate
                btn.title = name
                btn.disabled = true
                btn.classList.add('sapperOpened')
                btn.style.color = SAPPER_COLORS[rate]
            } else if (/^dead:/.test(data.sapper.field[i][j])) {
                const [, name] = data.sapper.field[i][j].split(':')
                btn.innerHTML = '💀'
                btn.title = name
                btn.disabled = true
                btn.classList.add('sapperBomb')
            } else {
                if (data.sapper.field[i][j] === 'flagged') {
                    btn.innerHTML = '💩'
                }
            }

            row.appendChild(btn)
        }

        field.appendChild(row)
        gameField.appendChild(field)
    }
    const score = document.createElement('ul')
    data.sapper.players.forEach(({ name, dead, opened }) => {
        const player = document.createElement('li')
        player.innerHTML = `${name} [${dead ? '💀' : '👶'}]: ${opened}`
        score.appendChild(player)
    })

    gameField.appendChild(score)
}

const tickSapperGame = (data) => {
    gameField.classList.remove('hidden')
    redrawField(data)
}

const stopSapperGame = () => {
    const closeBtn = document.createElement('button')
    closeBtn.type = 'button'
    closeBtn.innerHTML = 'Close'
    closeBtn.classList.add('userBtn')
    closeBtn.classList.add('closeBtn')
    closeBtn.addEventListener('click', () => {
        gameField.innerHTML = ''
        gameField.classList.add('hidden')
    })
    gameField.appendChild(closeBtn)
}
