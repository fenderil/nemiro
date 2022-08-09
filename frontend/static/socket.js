const socket = new WebSocket(`${protocol}//${window.location.host}/stream/${roomId}`)

socket.onopen = () => {
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

socket.onclose = (event) => {
    if (event.wasClean) {
        console.warn(`[close] Соединение закрыто чисто, код=${event.code} причина=${event.reason}`)
    } else {
        console.warn('[close] Соединение прервано')
    }
}

socket.onerror = (error) => {
    console.error(error.message)
}
