if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/worker.js')
        .then((registration) => {
        })
        .catch((error) => {
        })
} else {
}
