if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/worker.js')
        .then((registration) => {
            console.log('Service worker зарегистрирован:', registration)
        })
        .catch((error) => {
            console.log('Ошибка при регистрации service worker-а:', error)
        })
} else {
    console.log('Текущий браузер не поддерживает service worker-ы.')
}
