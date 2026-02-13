const CACHE_NAME = 'catalog-maker-v2';
const ASSETS = [
    '/',
    '/index.html',
    '/manifest.json',
    '/icons/icon-72.png',
    '/icons/icon-96.png',
    '/icons/icon-128.png',
    '/icons/icon-144.png',
    '/icons/icon-152.png',
    '/icons/icon-192.png',
    '/icons/icon-384.png',
    '/icons/icon-512.png'
];

// Install
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(ASSETS))
            .then(() => self.skipWaiting())
    );
});

// Activate
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys()
            .then(keys => Promise.all(
                keys.filter(key => key !== CACHE_NAME)
                    .map(key => caches.delete(key))
            ))
            .then(() => self.clients.claim())
    );
});

// Fetch
self.addEventListener('fetch', event => {
    if (event.request.method !== 'GET') return;
    
    event.respondWith(
        caches.match(event.request)
            .then(cached => {
                if (cached) return cached;
                
                return fetch(event.request)
                    .then(response => {
                        if (!response || response.status !== 200) return response;
                        
                        const responseClone = response.clone();
                        caches.open(CACHE_NAME)
                            .then(cache => cache.put(event.request, responseClone));
                        
                        return response;
                    })
                    .catch(() => caches.match('/index.html'));
            })
    );
});

// Background Sync
self.addEventListener('sync', event => {
    if (event.tag === 'sync-products') {
        event.waitUntil(syncProducts());
    }
});

async function syncProducts() {
    // Future sync implementation
}

// Push Notifications
self.addEventListener('push', event => {
    const data = event.data ? event.data.text() : 'New notification';
    
    self.registration.showNotification('Catalog Maker', {
        body: data,
        icon: '/icons/icon-192.png',
        badge: '/icons/icon-72.png'
    });
});

self.addEventListener('notificationclick', event => {
    event.notification.close();
    event.waitUntil(clients.openWindow('/'));
});
