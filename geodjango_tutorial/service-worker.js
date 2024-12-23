const CACHE_NAME = 'webmap-cache-v1';
const urlsToCache = [
    '/pwa/',  // Update this to match your actual path
    '/static/css/styles.css',
    '/static/manifest.json',
    '/static/images/icons/icon-72x72.png',
    '/static/images/icons/icon-96x96.png',
    '/static/images/icons/icon-128x128.png',
    '/static/images/icons/icon-144x144.png',
    '/static/images/icons/icon-152x152.png',
    '/static/images/icons/icon-192x192.png',
    '/static/images/icons/icon-384x384.png',
    '/static/images/icons/icon-512x512.png'
];

sself.addEventListener('install', event => {
    console.log('Service Worker: Installing...');
    event.waitUntil(
      caches.open(CACHE_NAME)
        .then(cache => {
          console.log('Service Worker: Opening Cache');
          return Promise.all(
            urlsToCache.map(url => {
              return cache.add(url).catch(error => {
                console.log('Failed to cache:', url, error);
                return Promise.resolve();
              });
            })
          );
        })
    );
  });
  
  self.addEventListener('fetch', event => {
    event.respondWith(
      caches.match(event.request)
        .then(response => {
          if (response) {
            // Return cached response
            return response;
          }
          
          // Try to fetch from network
          return fetch(event.request)
            .catch(() => {
              // If fetch fails, return offline page for navigation requests
              if (event.request.mode === 'navigate') {
                return caches.match('/static/offline.html');
              }
              
              // For other resources, return a simple error response
              return new Response('Offline content not available', {
                status: 503,
                statusText: 'Service Unavailable',
                headers: new Headers({
                  'Content-Type': 'text/plain'
                })
              });
            });
        })
    );
  });
  
  // Add activate event to clean up old caches
  self.addEventListener('activate', event => {
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
  });