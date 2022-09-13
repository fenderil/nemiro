import { state } from '../../data/state'
import { nodes } from '../../data/nodes'
import './style.css'

export const renderUsers = (users) => {
    state.savedUsers = users
    nodes.usersRoot.innerHTML = ''
    users.forEach(({ name: userName, online, admin }) => {
        const user = document.createElement('li')
        user.classList.add('user')
        user.classList.add(online ? 'online' : 'offline')
        if (state.userName === userName) {
            user.classList.add('ownName')
        }
        if (admin) {
            user.classList.add('admin')
        }
        user.innerHTML = userName
        nodes.usersRoot.appendChild(user)
    })
}
