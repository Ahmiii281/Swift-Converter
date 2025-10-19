// Enhanced Service Worker for Swift Converter
const CACHE_NAME = 'swift-converter-v2.0.0';
const STATIC_CACHE_NAME = 'swift-converter-static-v2.0.0';
const DYNAMIC_CACHE_NAME = 'swift-converter-dynamic-v2.0.0';

// Files to cache for offline functionality
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/imagetotext.html',
    '/pdftoword.html',
    '/pptxtopdf.html',
    '/style.css',
    '/JS/theme.js',
    '/JS/imagetotext.js',
    '/JS/pdftoword.js',
    '/JS/pptxtopdf.js',
    '/urlshortener.html',
    '/JS/urlshortener.js',
    '/manifest.json',
    // External CDN resources
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
    'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css',
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
    'https://cdn.jsdelivr.net/npm/tesseract.js@5.0.2/dist/tesseract.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js',
    'https://cdn.jsdelivr.net/npm/docx@8.5.0/build/index.umd.min.js'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
    console.log('Service Worker: Installing...');
    
    event.waitUntil(
        Promise.all([
            caches.open(STATIC_CACHE_NAME).then((cache) => {
                console.log('Service Worker: Caching static assets');
                return cache.addAll(STATIC_ASSETS);
            }),
            self.skipWaiting()
        ])
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('Service Worker: Activating...');
    
    event.waitUntil(
        Promise.all([
            caches.keys().then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== STATIC_CACHE_NAME && 
                            cacheName !== DYNAMIC_CACHE_NAME &&
                            cacheName.startsWith('swift-converter-')) {
                            console.log('Service Worker: Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            }),
            self.clients.claim()
        ])
    );
});

// Fetch event - serve cached content when offline
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }
    
    // Skip chrome-extension and other non-http requests
    if (!url.protocol.startsWith('http')) {
        return;
    }
    
    event.respondWith(
        handleRequest(request)
    );
});

async function handleRequest(request) {
    const url = new URL(request.url);
    
    try {
        // Try network first for API calls and dynamic content
        if (isApiRequest(url) || isDynamicContent(url)) {
            return await networkFirst(request);
        }
        
        // Try cache first for static assets
        return await cacheFirst(request);
        
    } catch (error) {
        console.log('Service Worker: Request failed:', error);
        
        // Return offline page for navigation requests
        if (request.mode === 'navigate') {
            return await getOfflinePage();
        }
        
        // Return cached version if available
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        throw error;
    }
}

async function cacheFirst(request) {
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
        return cachedResponse;
    }
    
    try {
        const networkResponse = await fetch(request);
        
        // Cache successful responses
        if (networkResponse.ok) {
            const cache = await caches.open(STATIC_CACHE_NAME);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        throw error;
    }
}

async function networkFirst(request) {
    try {
        const networkResponse = await fetch(request);
        
        // Cache successful responses
        if (networkResponse.ok) {
            const cache = await caches.open(DYNAMIC_CACHE_NAME);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        // Fall back to cache
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        throw error;
    }
}

function isApiRequest(url) {
    return url.pathname.startsWith('/api/') || 
           url.hostname.includes('api') ||
           url.searchParams.has('api');
}

function isDynamicContent(url) {
    return url.pathname.includes('convert') ||
           url.pathname.includes('upload') ||
           url.pathname.includes('download');
}

async function getOfflinePage() {
    const cache = await caches.open(STATIC_CACHE_NAME);
    const offlinePage = await cache.match('/index.html');
    
    if (offlinePage) {
        return offlinePage;
    }
    
    // Return a basic offline response
    return new Response(
        `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Offline - Swift Converter</title>
            <style>
                body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    min-height: 100vh;
                    margin: 0;
                    background: #f3f4f6;
                    text-align: center;
                }
                .offline-container {
                    background: white;
                    padding: 2rem;
                    border-radius: 1rem;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                    max-width: 400px;
                }
                .offline-icon {
                    font-size: 4rem;
                    color: #6b7280;
                    margin-bottom: 1rem;
                }
                h1 {
                    color: #374151;
                    margin-bottom: 1rem;
                }
                p {
                    color: #6b7280;
                    margin-bottom: 1.5rem;
                }
                .retry-btn {
                    background: #2563eb;
                    color: white;
                    border: none;
                    padding: 0.75rem 1.5rem;
                    border-radius: 0.5rem;
                    cursor: pointer;
                    font-size: 1rem;
                }
                .retry-btn:hover {
                    background: #1d4ed8;
                }
            </style>
        </head>
        <body>
            <div class="offline-container">
                <div class="offline-icon">📡</div>
                <h1>You're Offline</h1>
                <p>Please check your internet connection and try again.</p>
                <button class="retry-btn" onclick="window.location.reload()">
                    Try Again
                </button>
            </div>
        </body>
        </html>
        `,
        {
            headers: {
                'Content-Type': 'text/html',
            },
        }
    );
}

// Background sync for failed requests
self.addEventListener('sync', (event) => {
    if (event.tag === 'background-sync') {
        event.waitUntil(doBackgroundSync());
    }
});

async function doBackgroundSync() {
    console.log('Service Worker: Performing background sync');
    // Implement background sync logic here
}

// Push notifications (if needed in the future)
self.addEventListener('push', (event) => {
    if (event.data) {
        const data = event.data.json();
        const options = {
            body: data.body,
            icon: '/images/icon-192x192.png',
            badge: '/images/badge-72x72.png',
            vibrate: [100, 50, 100],
            data: {
                dateOfArrival: Date.now(),
                primaryKey: 1
            },
            actions: [
                {
                    action: 'explore',
                    title: 'Open App',
                    icon: '/images/checkmark.png'
                },
                {
                    action: 'close',
                    title: 'Close',
                    icon: '/images/xmark.png'
                }
            ]
        };
        
        event.waitUntil(
            self.registration.showNotification(data.title, options)
        );
    }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    
    if (event.action === 'explore') {
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

// Message handling for communication with main thread
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'GET_VERSION') {
        event.ports[0].postMessage({ version: CACHE_NAME });
    }
});

console.log('Service Worker: Loaded successfully');