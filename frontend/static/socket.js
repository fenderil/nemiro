const socket = new WebSocket(`${protocol}//${window.location.host}/stream/${roomId}`)

socket.onopen = (event) => {
    socket.send(JSON.stringify({
        name
    }))
}

socket.onmessage = (event) => {
    const data = JSON.parse(event.data)
    renderUsers(Object.values(data.users).map(({ name, online }) => ({ name, online })))
    
    elements = data.elements
    redrawScreen()
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
