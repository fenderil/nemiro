import { state } from './state'
import { nodes } from './nodes'

export const renderUsers = (users) => {
    state.savedUsers = users
    nodes.usersRoot.innerHTML = ''
    users.forEach(({ name: userName, online, admin }) => {
        const user = document.createElement('li')
        user.classList.add('user')
        user.classList.add(online ? 'online' : 'offline')
        if (state.choosenName === userName) {
            user.classList.add('ownName')
        }
        if (admin) {
            user.classList.add('admin')
        }
        user.innerHTML = userName
        nodes.usersRoot.appendChild(user)
    })
}
