import {
    state,
    nodes,
    protocol,
    roomId,
} from './state'
import { redrawScreen } from './draw'
import { startTimer, stopTimer } from './timer'
import { games } from './games'
import { DATA_ACTIONS } from './constants'

const renderUsers = (users) => {
    state.savedUsers = users
    nodes.usersRoot.innerHTML = users.map(({ name: userName, online, admin }) => `
<li class="user ${
    state.choosenName === userName ? 'ownName' : ''
} ${
    admin ? 'admin' : ''
} ${
    online ? 'online' : 'offline'
}">${userName}</li>
    `).join('')

    redrawScreen()
}

export const openSocket = () => {
    const networkChannel = new WebSocket(`${protocol}//${window.location.host}/stream/${roomId}`)

    networkChannel.onopen = () => {
        if (state.socketTimeoutId) {
            clearInterval(state.socketTimeoutId)
            state.socketTimeoutId = null
        }

        networkChannel.send(JSON.stringify({
            name: state.choosenName,
        }))
    }

    networkChannel.onmessage = (event) => {
        const data = JSON.parse(event.data)

        if (data.users) {
            renderUsers(Object.values(data.users))
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
        if (!state.socketTimeoutId) {
            state.socketTimeoutId = setInterval(openSocket, 1000)
        }
    }

    networkChannel.onerror = (error) => {
        console.error(error.message)
    }

    state.sendDataUpdate = (data) => {
        networkChannel.send(JSON.stringify(data))
    }
}
