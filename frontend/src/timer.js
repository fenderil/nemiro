import { DATA_ACTIONS, DATA_TYPES } from './constants'
import { state } from './state'
import { nodes } from './nodes'
import './timer.css'

if (!state.admin) {
    nodes.timerBtn.classList.add('hidden')
}

const getLeftTime = (from, duration) => Math.floor(duration - (new Date() - from) / 1000)

export const toggleTimerState = (sendCommand) => {
    if (state.timerTimoutId) {
        nodes.timerBtn.innerHTML = 'Start 5min timer'
        if (sendCommand) {
            state.sendDataUpdate({
                action: DATA_ACTIONS.stop,
                type: DATA_TYPES.timer,
            })
        }
    } else {
        nodes.timerBtn.innerHTML = 'Stop timer'
        if (sendCommand) {
            state.sendDataUpdate({
                action: DATA_ACTIONS.start,
                type: DATA_TYPES.timer,
            })
        }
    }
}

export const stopTimer = () => {
    nodes.timerOutput.innerHTML = '00:00'
    clearInterval(state.timerTimoutId)
    nodes.timerOutput.classList.add('timerAlert')
    state.timerTimoutId = null
}

export const startTimer = ({ id = 0, from = new Date(), duration = 60 * 5 } = {}) => {
    if (id && id !== state.timerCounter && getLeftTime(from, duration) > 0) {
        clearInterval(state.timerTimoutId)

        state.timerTimoutId = setInterval(() => {
            const leftTime = getLeftTime(from, duration)
            nodes.timerOutput.classList.remove('timerAlert')

            if (leftTime <= 0) {
                stopTimer()
            } else {
                const lastSeconds = leftTime % 60
                const lastMinutes = (leftTime - lastSeconds) / 60

                nodes.timerOutput.innerHTML = `${
                    String(lastMinutes).padStart(2, '0')
                }:${
                    String(lastSeconds).padStart(2, '0')
                }`
            }
        }, 1000)
    }

    state.timerCounter = id
}
