const CACHE_NAME = 'v1'

const contentToCache = [
    '/static/nemiro.png',
]

const OFFLINE_URL = '/static/offline.html'

self.addEventListener('install', (event) => {
    event.waitUntil((async () => {
        const cache = await caches.open(CACHE_NAME)

        await cache.addAll(contentToCache)
        await cache.add(new Request(OFFLINE_URL, { cache: 'reload' }))
    })())
})

self.addEventListener('fetch', (event) => {
    if (event.request.mode === 'navigate') {
        event.respondWith((async () => {
            try {
                return await fetch(event.request)
            } catch (error) {
                const cache = await caches.open(CACHE_NAME)
                const cachedResponse = await cache.match(OFFLINE_URL)
                return cachedResponse
            }
        })())
    }
})
