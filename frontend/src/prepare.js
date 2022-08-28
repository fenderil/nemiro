import { state, roomId } from './state'
import { getCookie } from './utils'

state.choosenName = getCookie(`${roomId}:userName`)
    || window.prompt('Insert your name')
    || `Guest${Math.floor(Math.random() * 100500)}`

state.admin = getCookie(`${roomId}:admin`)

document.cookie = `${roomId}:userName=${state.choosenName}`
