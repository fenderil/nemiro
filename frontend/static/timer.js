if (!admin) {
    timerBtn.classList.add('hidden')
}

const getLeftTime = (from, duration) => Math.floor(duration - (new Date() - from) / 1000)

const toggleTimerState = (sendCommand) => {
    if (timerTimoutId) {
        timerBtn.innerHTML = 'Start 5min timer'
        crocodileBtn.classList.remove('hidden')
        if (sendCommand) {
            sendDataUpdate({ action: 'stop', type: 'timer' })
        }
    } else {
        timerBtn.innerHTML = 'Stop timer'
        crocodileBtn.classList.add('hidden')
        if (sendCommand) {
            sendDataUpdate({ action: 'start', type: 'timer' })
        }
    }
}

timerBtn.addEventListener('click', () => {
    toggleTimerState(true)
})

const stopTimer = () => {
    timerOutput.innerHTML = '00:00'
    clearInterval(timerTimoutId)
    timerOutput.classList.add('timerAlert')
    timerTimoutId = null
}

const startTimer = ({ id = 0, from = new Date(), duration = 60 * 5 } = {}) => {
    if (id && id !== timerCounter && getLeftTime(from, duration) > 0) {
        clearInterval(timerTimoutId)

        timerTimoutId = setInterval(() => {
            const leftTime = getLeftTime(from, duration)
            timerOutput.classList.remove('timerAlert')

            if (leftTime <= 0) {
                stopTimer()
            } else {
                const lastSeconds = leftTime % 60
                const lastMinutes = (leftTime - lastSeconds) / 60

                timerOutput.innerHTML = `${String(lastMinutes).padStart(2, '0')}:${String(lastSeconds).padStart(2, '0')}`
            }
        }, 1000)
    }

    timerCounter = id
}