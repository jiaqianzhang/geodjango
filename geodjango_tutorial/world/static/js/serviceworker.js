const CACHE_NAME = 'cafe-finder-v1';
const STATIC_CACHE = 'static-cache-v1';
const DYNAMIC_CACHE = 'dynamic-cache-v1';

// Only cache essential static assets
const STATIC_ASSETS = [
    '/',
    '/static/css/styles.css',
    '/static/css/map.css',
    '/static/js/cafe-map.js',
    '/static/js/pwa-install.js',
    '/static/images/icon1.png',
    '/static/images/icon2.png',
    '/static/images/offline.png',
    // '/static/leaflet/leaflet.css',
    // '/static/leaflet/leaflet.js',
    // '/static/leaflet/images/marker-icon.png',
    // '/static/leaflet/images/marker-shadow.png',
    '/offline/'
];

// Add jQuery and Bootstrap to EXTERNAL_ASSETS
const EXTERNAL_ASSETS = [
    'https://cdn.jsdelivr.net/npm/bootstrap@5.3.1/dist/css/bootstrap.min.css',
    'https://cdn.jsdelivr.net/npm/bootstrap@5.3.1/dist/js/bootstrap.bundle.min.js',
    'https://unpkg.com/leaflet@1.7.1/dist/leaflet.js',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// Separate font files
const FONT_FILES = [
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/webfonts/fa-solid-900.woff2',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/webfonts/fa-solid-900.ttf',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/webfonts/fa-brands-400.woff2',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/webfonts/fa-brands-400.ttf',
    'https://fonts.gstatic.com/s/poppins/v22/pxiByp8kv8JHgFVrLEj6Z1xlFd2JQEk.woff2',
    'https://fonts.gstatic.com/s/poppins/v22/pxiByp8kv8JHgFVrLGT9Z1xlFd2JQEk.woff2',
    'https://fonts.gstatic.com/s/poppins/v22/pxiEyp8kv8JHgFVrJJfecnFHGPc.woff2'
];

// Install event handler
self.addEventListener('install', (event) => {
    event.waitUntil(
        Promise.all([
            // Cache static assets
            caches.open(STATIC_CACHE).then((cache) => {
                return cache.addAll(STATIC_ASSETS);
            }),
            // Cache external resources (Bootstrap, jQuery, Leaflet, etc.)
            caches.open(DYNAMIC_CACHE).then((cache) => {
                return Promise.all([
                    ...EXTERNAL_ASSETS.map(url =>
                        fetch(url, { 
                            mode: 'no-cors',
                            credentials: 'omit'
                        })
                        .then(response => cache.put(url, response))
                        .catch(error => console.log('Failed to cache:', url, error))
                    ),
                    ...FONT_FILES.map(url =>
                        fetch(url, { 
                            mode: 'cors',
                            credentials: 'omit'
                        })
                        .then(response => cache.put(url, response))
                        .catch(error => console.log('Failed to cache font:', url, error))
                    )
                ]);
            })
        ])
    );
    self.skipWaiting();
});

// Fetch event listener
self.addEventListener('fetch', (event) => {
    // Handle navigation requests differently
    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request)
                .catch(() => {
                    return caches.match('/offline/') // Serve cached offline page
                        .then(response => {
                            if (response) {
                                return response;
                            }
                            // If offline page not in cache, return basic offline HTML
                            return new Response(
                                `<!DOCTYPE html>
                                <html>
                                <head>
                                    <title>Offline - Cafe Finder</title>
                                    <meta name="viewport" content="width=device-width, initial-scale=1">
                                    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.1/dist/css/bootstrap.min.css" rel="stylesheet">
                                </head>
                                <body class="bg-light">
                                    <div class="container mt-5 text-center">
                                        <div class="alert alert-warning p-5 rounded-3 shadow-sm">
                                            <i class="fas fa-wifi-slash fa-3x mb-3"></i>
                                            <h2>You're Offline</h2>
                                            <p class="lead">Please check your internet connection and try again.</p>
                                            <button onclick="window.location.reload()" class="btn btn-warning mt-3">
                                                Try Again
                                            </button>
                                        </div>
                                    </div>
                                </body>
                                </html>`,
                                {
                                    headers: {
                                        'Content-Type': 'text/html',
                                        'Cache-Control': 'no-store'
                                    }
                                }
                            );
                        });
                })
        );
        return;
    }

    // Handle API requests
    // Add this network-first strategy for API and dynamic content
    if (!event.request.url.includes('/map/?latitude=') && event.request.method === 'GET') {
        event.respondWith(
            fetch(event.request)
                .then(networkResponse => {
                    // Clone the response before using it
                    const responseToCache = networkResponse.clone();

                    // Update cache with new response
                    if (responseToCache.status === 200) {
                        caches.open(DYNAMIC_CACHE).then(cache => {
                            cache.put(event.request, responseToCache);
                        });
                    }

                    return networkResponse;
                })
                .catch(() => {
                    // If network fails, try cache
                    return caches.match(event.request);
                })
        );
    }
});


// Activate event handler (cleanup old caches)
self.addEventListener('activate', (event) => {
    event.waitUntil(
        Promise.all([
            caches.keys().then((cacheNames) => {
                return Promise.all(
                    cacheNames
                        .filter((cacheName) => {
                            // Delete old versions of caches
                            return (cacheName.startsWith('static-cache-') && cacheName !== STATIC_CACHE) ||
                                   (cacheName.startsWith('dynamic-cache-') && cacheName !== DYNAMIC_CACHE) ||
                                   (cacheName.startsWith('cafe-finder-') && cacheName !== CACHE_NAME);
                        })
                        .map((cacheName) => {
                            console.log('Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        })
                );
            }),
            // Take control of all clients immediately
            self.clients.claim()
        ])
    );
});


// Background Sync
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-cafes') {
        event.waitUntil(syncCafes());
    }
});

// Push Notifications
self.addEventListener('push', (event) => {
    const options = {
        body: event.data.text(),
        icon: '/static/images/icon1.png',
        badge: '/static/images/badge.png',
        vibrate: [100, 50, 100],
    };

    event.waitUntil(
        self.registration.showNotification('Café Finder', options)
    );
});

// Helper function for background sync
async function syncCafes() {
    console.log('Background sync executed');
}

self.addEventListener('message', (event) => {
    if (event.data === 'skipWaiting') {
        self.skipWaiting();
    }
});



// const CACHE_NAME = 'cafe-finder-v1';
// const STATIC_CACHE = 'static-cache-v1';
// const DYNAMIC_CACHE = 'dynamic-cache-v1';

// const STATIC_ASSETS = [
//     '/static/css/styles.css',
//     '/static/css/signup.css',
//     '/static/css/map.css',
//     '/static/css/auth.css',
//     '/static/js/cafe-map.js',
//     '/static/images/icon1.png',
//     '/static/images/icon2.png',
//     '/offline/'
// ];

// // Add jQuery and Bootstrap to EXTERNAL_ASSETS
// const EXTERNAL_ASSETS = [
//     'https://cdn.jsdelivr.net/npm/bootstrap@5.3.1/dist/css/bootstrap.min.css',
//     'https://cdn.jsdelivr.net/npm/bootstrap@5.3.1/dist/js/bootstrap.bundle.min.js',
//     'https://code.jquery.com/jquery-3.6.0.min.js',
//     'https://unpkg.com/leaflet@1.7.1/dist/leaflet.css',
//     'https://unpkg.com/leaflet@1.7.1/dist/leaflet.js',
//     'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
//     'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap'
// ];

// // Separate font files
// const FONT_FILES = [
//     'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/webfonts/fa-solid-900.woff2',
//     'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/webfonts/fa-solid-900.ttf',
//     'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/webfonts/fa-brands-400.woff2',
//     'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/webfonts/fa-brands-400.ttf',
//     'https://fonts.gstatic.com/s/poppins/v22/pxiByp8kv8JHgFVrLEj6Z1xlFd2JQEk.woff2',
//     'https://fonts.gstatic.com/s/poppins/v22/pxiByp8kv8JHgFVrLGT9Z1xlFd2JQEk.woff2',
//     'https://fonts.gstatic.com/s/poppins/v22/pxiEyp8kv8JHgFVrJJfecnFHGPc.woff2'
// ];

// // Install event - Cache static assets
// self.addEventListener('install', (event) => {
//     event.waitUntil(
//         Promise.all([
//             // Cache static assets
//             caches.open(STATIC_CACHE).then((cache) => {
//                 return cache.addAll(STATIC_ASSETS);
//             }),
//             // Cache external resources
//             caches.open(DYNAMIC_CACHE).then((cache) => {
//                 return Promise.all([
//                     ...EXTERNAL_ASSETS.map(url =>
//                         fetch(url, { 
//                             mode: 'no-cors',
//                             credentials: 'omit'
//                         })
//                         .then(response => cache.put(url, response))
//                         .catch(error => console.log('Failed to cache:', url, error))
//                     ),
//                     ...FONT_FILES.map(url =>
//                         fetch(url, { 
//                             mode: 'cors',
//                             credentials: 'omit'
//                         })
//                         .then(response => cache.put(url, response))
//                         .catch(error => console.log('Failed to cache font:', url, error))
//                     )
//                 ]);
//             })
//         ])
//     );
//     self.skipWaiting();
// });

// // Activate event - Clean up old caches
// self.addEventListener('activate', (event) => {
//     event.waitUntil(
//         Promise.all([
//             caches.keys().then((cacheNames) => {
//                 return Promise.all(
//                     cacheNames
//                         .filter((cacheName) => {
//                             return (cacheName.startsWith('cafe-finder-') && cacheName !== CACHE_NAME) ||
//                                    (cacheName.startsWith('static-cache-') && cacheName !== STATIC_CACHE) ||
//                                    (cacheName.startsWith('dynamic-cache-') && cacheName !== DYNAMIC_CACHE);
//                         })
//                         .map((cacheName) => {
//                             return caches.delete(cacheName);
//                         })
//                 );
//             }),
//             self.clients.claim()
//         ])
//     );
// });

// // Fetch event - Handle static assets and offline functionality
// self.addEventListener('fetch', (event) => {
//     // Skip non-GET requests and authentication-related URLs
//     if (event.request.method !== 'GET' || 
//         event.request.url.includes('/login/') || 
//         event.request.url.includes('/signup/') ||
//         event.request.url.endsWith('/')) {
//         return;
//     }

//     event.respondWith(
//         (async () => {
//             const isStatic = STATIC_ASSETS.some(url => 
//                 event.request.url.includes(url)
//             );

//             const isExternal = EXTERNAL_ASSETS.some(url => 
//                 event.request.url.startsWith(url)
//             );
            
//             const isFontRequest = FONT_FILES.some(url => 
//                 event.request.url.startsWith(url)
//             ) || 
//             event.request.url.includes('fonts.gstatic.com') || 
//             event.request.url.includes('/webfonts/');

//             try {
//                 // Try cache first
//                 const cachedResponse = await caches.match(event.request);
//                 if (cachedResponse) {
//                     return cachedResponse;
//                 }

//                 // If not in cache, try network
//                 const fetchOptions = {
//                     mode: isFontRequest ? 'cors' : (isExternal ? 'no-cors' : 'cors'),
//                     credentials: (isFontRequest || isExternal) ? 'omit' : 'same-origin'
//                 };

//                 const response = await fetch(event.request, fetchOptions);
                
//                 // Cache successful responses
//                 if (response && response.status === 200) {
//                     const responseToCache = response.clone();
//                     const cache = await caches.open(isStatic ? STATIC_CACHE : DYNAMIC_CACHE);
//                     try {
//                         await cache.put(event.request, responseToCache);
//                     } catch (error) {
//                         console.log('Caching failed:', error);
//                     }
//                 }

//                 return response;
//             } catch (error) {
//                 // Return offline page if available
//                 if (event.request.mode === 'navigate') {
//                     const cache = await caches.open(STATIC_CACHE);
//                     return cache.match('/offline/');
//                 }
//                 throw error;
//             }
//         })()
//     );
// });

// // Background Sync
// self.addEventListener('sync', (event) => {
//     if (event.tag === 'sync-cafes') {
//         event.waitUntil(syncCafes());
//     }
// });

// // Push Notifications
// self.addEventListener('push', (event) => {
//     const options = {
//         body: event.data.text(),
//         icon: '/static/images/icon1.png',
//         badge: '/static/images/badge.png',
//         vibrate: [100, 50, 100],
//     };

//     event.waitUntil(
//         self.registration.showNotification('Café Finder', options)
//     );
// });
