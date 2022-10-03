import './style.css'

const INTERVAL = 1000 * 60 * 10
const ACTIVE_TIME = 1000 * 9

export const easterEgg = () => {
    setInterval(() => {
        document.querySelector('.easter').classList.add('active')

        setTimeout(() => {
            document.querySelector('.easter').classList.remove('active')
        }, ACTIVE_TIME)
    }, INTERVAL)
}
