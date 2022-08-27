const choosenName = getCookie(`${roomId}:userName`) || window.prompt('Insert your name') || `Guest${Math.floor(Math.random() * 100500)}`
const admin = getCookie(`${roomId}:admin`)
document.cookie = `${roomId}:userName=${choosenName}`

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
    }
  })
})

customColorSelector.addEventListener('click', () => {
  document.getElementById('customColorFake').checked = true
  selectedColor = customColorSelector.value
})

customColorSelector.addEventListener('change', (event) => {
  selectedColor = event.target.value
  customColorIndicator.style.borderColor = event.target.value
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
