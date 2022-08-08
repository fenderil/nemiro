
const cacheName = 'v1'

const contentToCache = [
    '/favicon.ico'
]
    
self.addEventListener('install', (event) => {
    console.log('[Service Worker] Install')
    event.waitUntil((async () => {
        const cache = await caches.open(cacheName)
        console.log('[Service Worker] Caching all: app shell and content')

        await cache.addAll(contentToCache)
    })())
})


