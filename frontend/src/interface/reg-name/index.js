import { state } from '../../data/state'
import { nodes } from '../../data/nodes'
import { openSocket } from '../../data/socket'
import './style.css'

const onKeySetName = (event) => {
    if (event.keyCode === 13 || event.keyCode === 27) {
        // eslint-disable-next-line no-use-before-define
        setName(event)
    }
}

const setName = () => {
    state.userName = nodes.nameInput.value
    nodes.modal.classList.add('hidden')
    document.cookie = `${state.roomId}:userName=${state.userName}`
    openSocket()
    nodes.nameInput.removeEventListener('keydown', onKeySetName)
    nodes.nameInput.removeEventListener('blur', setName)
    nodes.nameEnter.removeEventListener('click', setName)
    nodes.nameCancel.removeEventListener('click', setName)
}

export const regName = () => {
    if (!state.userName) {
        nodes.modal.classList.remove('hidden')
        nodes.nameInput.value = `Guest${Math.floor(Math.random() * 100500)}`
        nodes.nameInput.focus()
        nodes.nameInput.setSelectionRange(0, nodes.nameInput.value.length)
        nodes.nameInput.addEventListener('keydown', onKeySetName)
        nodes.nameEnter.addEventListener('click', setName)
        nodes.nameCancel.addEventListener('click', setName)
    } else {
        openSocket()
    }
}