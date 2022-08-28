canvasRoot.classList.add('pointer')

const changeSelectedType = (value) => {
    canvasRoot.classList.remove(selectedType)
    selectedType = value
    canvasRoot.classList.add(selectedType)
}

document.querySelectorAll('[name=type]').forEach((control) => {
    control.addEventListener('click', (event) => {
        changeSelectedType(event.target.value)
    })
})

document.querySelectorAll('[name=color]').forEach((control) => {
    control.addEventListener('click', (event) => {
        if (event.target.value !== 'custom') {
            selectedColor = event.target.value

            if (cursorSelectedElements.length) {
                cursorSelectedElements.forEach((element) => {
                    sendDataUpdate({
                        ...element,
                        color: selectedColor,
                        action: 'edit',
                    })
                })
            }
        }
    })
})

customColorSelector.addEventListener('click', () => {
    document.getElementById('customColorFake').checked = true
    selectedColor = customColorSelector.value

    if (cursorSelectedElements.length) {
        cursorSelectedElements.forEach((element) => {
            sendDataUpdate({
                ...element,
                color: selectedColor,
                action: 'edit',
            })
        })
    }
})

customColorSelector.addEventListener('change', (event) => {
    selectedColor = event.target.value
    customColorIndicator.style.borderColor = event.target.value

    if (cursorSelectedElements.length) {
        cursorSelectedElements.forEach((element) => {
            sendDataUpdate({
                ...element,
                color: selectedColor,
                action: 'edit',
            })
        })
    }
})

const renderUsers = (users) => {
    savedUsers = users
    usersRoot.innerHTML = users.map(({ name: userName, online, admin }) => `
<li class="user ${
    choosenName === userName ? 'ownName' : ''
} ${
    admin ? 'admin' : ''
} ${
    online ? 'online' : 'offline'
}">${userName}</li>
    `).join('')

    redrawScreen()
}

document.getElementById('roomLink').addEventListener('click', () => {
    window.navigator.clipboard.writeText(window.location)
    alert('Link in clipboard')
})