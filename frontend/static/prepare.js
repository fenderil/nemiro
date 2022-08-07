const protocol = window.location.protocol === 'http:' ? 'ws:' : 'wss:'
const roomId = window.location.pathname.replace('/room/', '')

const name = getCookie(`${roomId}:userName`) || window.prompt('Выберите имя') || `Guest${Math.floor(Math.random() * 100500)}`
document.cookie = `${roomId}:userName=${name}`

const usersRoot = document.getElementById('users')
const canvasRoot = document.getElementById('canvas')
const customColorSelector = document.getElementById('customColor')
const customColorIndicator = document.getElementById('customColorIndicator')
customColorIndicator.style.borderColor = customColorSelector.value
let type = 'pointer'
let color = 'black'
const canvasContext = canvasRoot.getContext('2d')
canvasContext.font = '16px sans-serif'
canvasContext.textAlign = 'start'
canvasContext.textBaseline = 'top'

const MAX_STICKER_WIDTH = 160

canvasRoot.classList.add('pointer')

document.querySelectorAll('[name=type]').forEach((control) => {
    control.addEventListener('click', (event) => {
        canvasRoot.classList.remove(type)
        type = event.target.value
        canvasRoot.classList.add(type)
        if (event.target.value === 'pointer') {
            canvasRoot.parentNode.classList.remove('fixed')
        } else {
            canvasRoot.parentNode.classList.add('fixed')
        }
    })
})

document.querySelectorAll('[name=color]').forEach((control) => {
    control.addEventListener('click', (event) => {
        if (event.target.value === 'custom') {
            
        } else {                    
            color = event.target.value
        }
    })
})

customColorSelector.addEventListener('click', () => {
    document.getElementById('customColorFake').checked = true
    color = customColorSelector.value
})

customColorSelector.addEventListener('change', (event) => {
    color = event.target.value
    customColorIndicator.style.borderColor = event.target.value
})

const renderUsers = (users) => {
    usersRoot.innerHTML = users.map(({ name, online }) => `
        <li class="user ${online ? 'online' : 'offline'}">${name}</li>
    `).join()
}