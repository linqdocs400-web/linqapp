// Versioned cache name - update this on each deployment
const CACHE_NAME = `linq-cache-v${Date.now()}`;
const STATIC_CACHE_NAME = `linq-static-v${Date.now()}`;
const RUNTIME_CACHE_NAME = 'linq-runtime';

// Core static assets to cache immediately
const urlsToCache = [
  '/',
  '/manifest.json',
  '/icons/icon-192.svg',
  '/icons/icon-512.svg',
];

// Install event - cache resources and skip waiting
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    Promise.all([
      // Cache core static assets
      caches.open(STATIC_CACHE_NAME).then((cache) => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(urlsToCache);
      }),
      // Skip waiting to activate immediately
      self.skipWaiting()
    ])
  );
});

// Fetch event - network-first strategy for HTML, cache-first for static assets
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);
  
  // Skip non-GET requests and external requests
  if (request.method !== 'GET' || url.origin !== location.origin) {
    return;
  }

  // Network-first for HTML pages
  if (request.destination === 'document') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache the latest HTML response
          const responseClone = response.clone();
          caches.open(RUNTIME_CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
          return response;
        })
        .catch(() => {
          // Fallback to cached HTML if network fails
          return caches.match(request);
        })
    );
    return;
  }

  // Cache-first for static assets (JS, CSS, images, icons)
  if (request.destination === 'script' || 
      request.destination === 'style' || 
      request.destination === 'image' ||
      request.destination === 'font') {
    event.respondWith(
      caches.match(request)
        .then((response) => {
          if (response) {
            return response;
          }
          
          // Fetch from network and cache
          return fetch(request).then((response) => {
            if (!response || response.status !== 200) {
              return response;
            }
            
            const responseToCache = response.clone();
            caches.open(STATIC_CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache);
            });
            
            return response;
          });
        })
    );
    return;
  }

  // Default: try network first, fallback to cache
  event.respondWith(
    fetch(request)
      .catch(() => caches.match(request))
  );
});

// Activate event - clean up old caches and claim clients
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    Promise.all([
      // Delete all old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE_NAME && 
                cacheName !== RUNTIME_CACHE_NAME) {
              console.log('Service Worker: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Claim all clients to take control immediately
      self.clients.claim()
    ])
  );
  
  console.log('Service Worker: Activated and claimed clients');
});

// Handle messages for manual cache updates
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
