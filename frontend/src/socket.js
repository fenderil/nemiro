import { state } from './state'
import { redrawScreen } from './draw'
import { startTimer, stopTimer } from './timer'
import { games } from './games'
import { DATA_ACTIONS } from './constants'
import { renderUsers } from './users'

const { protocol, host } = window.location
const socketProtocol = protocol === 'http:' ? 'ws:' : 'wss:'
const endPoint = `${socketProtocol}//${host}/stream/${state.roomId}`

let socketTimeoutId = null

export const openSocket = () => {
    const networkChannel = new WebSocket(endPoint)

    networkChannel.onopen = () => {
        if (socketTimeoutId) {
            clearInterval(socketTimeoutId)
            socketTimeoutId = null
        }

        networkChannel.send(JSON.stringify({
            name: state.choosenName,
        }))
    }

    networkChannel.onmessage = (event) => {
        const data = JSON.parse(event.data)

        if (data.users) {
            renderUsers(Object.values(data.users))
            redrawScreen()
        }

        if (data.elements) {
            state.savedElements = data.elements
            redrawScreen()
        }

        if (data.timer && data.timer.action === DATA_ACTIONS.start) {
            startTimer(data.timer)
        }

        if (data.timer && data.timer.action === DATA_ACTIONS.stop) {
            stopTimer(data.timer)
        }

        if (data.games) {
            games(data)
        }
    }

    networkChannel.onclose = () => {
        // TODO: use reconnectAttempts
        if (!socketTimeoutId) {
            socketTimeoutId = setInterval(openSocket, 1000)
        }
    }

    networkChannel.onerror = (error) => {
        console.error(error.message)
    }

    state.sendDataUpdate = (data) => {
        networkChannel.send(JSON.stringify(data))
    }
}
