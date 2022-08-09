const timerBtn = document.getElementById('timerBtn')
const timerOutput = document.getElementById('timer')

if (!admin) {
    timerBtn.classList.add('hidden')
}

const getLastTime = (from, duration) => Math.floor(duration - (new Date() - from) / 1000)

let prevTimer = 0
let intervalId

const toggleTimerState = (sendCommand) => {
    if (intervalId) {
        timerBtn.innerHTML = 'Start 5min timer'
        gameBtn.classList.remove('hidden')
        if (sendCommand) {
            socket.send(JSON.stringify({ action: 'stop', type: 'timer' }))
        }
    } else {
        timerBtn.innerHTML = 'Stop timer'
        gameBtn.classList.add('hidden')
        if (sendCommand) {
            socket.send(JSON.stringify({ action: 'start', type: 'timer' }))
        }
    }
}

timerBtn.addEventListener('click', () => {
    toggleTimerState(true)
})

const stopTimer = () => {
    timerOutput.innerHTML = '00:00'
    clearInterval(intervalId)
    timerOutput.classList.add('timerAlert')
    intervalId = null
}

const startTimer = ({ id = 0, from = new Date(), duration = 60 * 5 } = {}) => {
    console.error(duration)
    if (id && id !== prevTimer && getLastTime(from, duration) > 0) {
        clearInterval(intervalId)

        intervalId = setInterval(() => {
            const lastTime = getLastTime(from, duration)
            timerOutput.classList.remove('timerAlert')

            if (lastTime <= 0) {
                stopTimer()
            } else {
                const lastSeconds = lastTime % 60
                const lastMinutes = (lastTime - lastSeconds) / 60

                timerOutput.innerHTML = `${String(lastMinutes).padStart(2, '0')}:${String(lastSeconds).padStart(2, '0')}`
            }
        }, 1000)
    }

    prevTimer = id
}