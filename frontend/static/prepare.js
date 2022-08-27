const choosenName = getCookie(`${roomId}:userName`) || window.prompt('Insert your name') || `Guest${Math.floor(Math.random() * 100500)}`
const admin = getCookie(`${roomId}:admin`)
document.cookie = `${roomId}:userName=${choosenName}`
