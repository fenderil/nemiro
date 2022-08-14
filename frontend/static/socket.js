let socketTimer = null
let socket

const openSocket = () => {
    socket = new WebSocket(`${protocol}//${window.location.host}/stream/${roomId}`)
    
    socket.onopen = () => {
        if (socketTimer) {
            clearInterval(socketTimer)
            socketTimer = null
        }

        socket.send(JSON.stringify({
            name
        }))
    }

    socket.onmessage = (event) => {
        const data = JSON.parse(event.data)
        
        if (data.users) {
            renderUsers(Object.values(data.users))
        }
        
        if (data.elements) {
            elements = data.elements
            redrawScreen()
        }

        if (data.timer && data.timer.action === 'start') {
            startTimer(data.timer)
        }

        if (data.timer && data.timer.action === 'stop') {
            stopTimer(data.timer)
        }

        if (data.game) {
            startGame(data.game)
        }
    }

    socket.onclose = () => {
        if (!socketTimer) {
            socketTimer = setInterval(openSocket, 1000)
        }
    }

    socket.onerror = (error) => {
        console.error(error.message)
    }
}

openSocket()
