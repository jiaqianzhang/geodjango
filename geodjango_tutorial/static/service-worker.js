const CACHE_NAME = 'webmap-cache-v1';
const urlsToCache = [
    '/pwa/',
    '/static/css/styles.css',
    '/static/manifest.json',
    '/static/images/icons/icon-72x72.png',
    '/static/images/icons/icon-96x96.png',
    '/static/images/icons/icon-128x128.png',
    '/static/images/icons/icon-144x144.png',
    '/static/images/icons/icon-152x152.png',
    '/static/images/icons/icon-192x192.png',
    '/static/images/icons/icon-384x384.png',
    '/static/images/icons/icon-512x512.png',
    '/static/offline.html'
];



self.addEventListener('install', event => {
    console.log('[Service Worker] Installing...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('[Service Worker] Caching files');
                return cache.addAll(urlsToCache);
            })
    );
});

self.addEventListener('activate', event => {
    console.log('[Service Worker] Activating...');
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    return self.clients.claim();
});

self.addEventListener('fetch', event => {
    event.respondWith(
        (async () => {
            // Check if we're online first
            try {
                const online = await self.fetch('/pwa/', { method: 'HEAD' });
                if (!online.ok) throw new Error('Offline');
                
                // If we're online, try network first
                try {
                    const networkResponse = await fetch(event.request);
                    // Cache the response for offline use
                    const cache = await caches.open(CACHE_NAME);
                    cache.put(event.request, networkResponse.clone());
                    return networkResponse;
                } catch (error) {
                    console.log('Network fetch failed, falling back to cache');
                    const cachedResponse = await caches.match(event.request);
                    if (cachedResponse) return cachedResponse;
                    if (event.request.mode === 'navigate') {
                        return caches.match('/static/offline.html');
                    }
                    return new Response('Offline content not available');
                }
            } catch (error) {
                // We're offline, try cache first
                console.log('Offline mode detected');
                const cachedResponse = await caches.match(event.request);
                if (cachedResponse) return cachedResponse;
                if (event.request.mode === 'navigate') {
                    return caches.match('/static/offline.html');
                }
                return new Response('Offline content not available');
            }
        })()
    );
});