import './style.css'

export const easterEgg = () => {
    setInterval(() => {
        document.querySelector('.rat').classList.add('active')
        document.querySelector('.snake').classList.add('active')

        setTimeout(() => {
            document.querySelector('.rat').classList.remove('active')
            document.querySelector('.snake').classList.remove('active')
        }, 9000)
    }, 1000 * 60 * 10)
}
