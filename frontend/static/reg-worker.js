if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/worker.js')
    .then((registration) => {
      console.log('Service worker had been registered:', registration)
    })
    .catch((error) => {
      console.log('Service worker registration error:', error)
    })
} else {
  console.log('No service workers in this browsers.')
}
