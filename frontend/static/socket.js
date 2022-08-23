const openSocket = () => {
    const networkChannel = new WebSocket(`${protocol}//${window.location.host}/stream/${roomId}`)
    
    networkChannel.onopen = () => {
        if (socketTimeoutId) {
            clearInterval(socketTimeoutId)
            socketTimeoutId = null
        }

        networkChannel.send(JSON.stringify({
            name: choosenName
        }))
    }

    networkChannel.onmessage = (event) => {
        const data = JSON.parse(event.data)
        
        if (data.users) {
            renderUsers(Object.values(data.users))
        }
        
        if (data.elements) {
            savedElements = data.elements
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

    networkChannel.onclose = () => {
        if (!socketTimeoutId) {
            socketTimeoutId = setInterval(openSocket, 1000)
        }
    }

    networkChannel.onerror = (error) => {
        console.error(error.message)
    }

    sendDataUpdate = (data) => {
        networkChannel.send(JSON.stringify(data))
    }
}

openSocket()
