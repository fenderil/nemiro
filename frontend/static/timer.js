const timerBtn = document.getElementById('timerBtn')
const timerOutput = document.getElementById('timer')

timerBtn.addEventListener('click', () => {
    socket.send(JSON.stringify({ action: 'start', type: 'timer' }))
})

let prevTimer = 0
let setIntervalId
const startTimer = ({ id = 0, from = new Date(), duration = 60 * 5 } = {}) => {
    if (id && id !== prevTimer) {
        setIntervalId = setInterval(() => {
            const lastTime = Math.floor((duration * 1000 - (new Date() - from)) / 1000)
            timerOutput.classList.remove('timerAlert')

            if (lastTime < 0) {
                timerOutput.innerHTML = '00:00'
                clearInterval(setIntervalId)
                timerOutput.classList.add('timerAlert')
            } else {
                const lastSeconds = lastTime % 60
                const lastMinutes = (lastTime - lastSeconds) / 60

                timerOutput.innerHTML = `${String(lastMinutes).padStart(2, '0')}:${String(lastSeconds).padStart(2, '0')}`
            }
        }, 1000)
    }

    prevTimer = id
}