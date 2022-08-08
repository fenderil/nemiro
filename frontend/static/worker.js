
const CACHE_NAME = 'v1'

const contentToCache = [
    '/static/nemiro.png'
]

const OFFLINE_URL = '/static/offline.html'
    
self.addEventListener('install', (event) => {
    console.log('[Service Worker] Install')
    event.waitUntil((async () => {
        const cache = await caches.open(CACHE_NAME)
        console.log('[Service Worker] Caching all: app shell and content')

        await cache.addAll(contentToCache)
        await cache.add(new Request(OFFLINE_URL, { cache: 'reload' }))
    })())
})

self.addEventListener('fetch', (event) => {
    if (event.request.mode === 'navigate') {
        event.respondWith((async () => {
            try {
                const preloadResponse = await event.preloadResponse
                if (preloadResponse) {
                    return preloadResponse
                }
        
                const networkResponse = await fetch(event.request)
                return networkResponse
            } catch (error) {
                console.log('Fetch failed; returning offline page instead.', error)
        
                const cache = await caches.open(CACHE_NAME)
                const cachedResponse = await cache.match(OFFLINE_URL)
                return cachedResponse
            }
        })())
    }
})
