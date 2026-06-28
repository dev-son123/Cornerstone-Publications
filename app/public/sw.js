// public/sw.js — offline service worker
// Caches the app shell on install, serves cached pages on network failure

const CACHE_NAME = 'cornerstone-v2';
const SHELL = [
  '/',
  '/index.html',
  '/logo.jpeg',
  '/journal-logo.jpeg',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  // Only handle GET requests for same-origin or CDN assets
  if (request.method !== 'GET') return;

  event.respondWith(
    fetch(request)
      .then((response) => {
        // Cache fresh responses for navigation requests
        if (request.mode === 'navigate' || request.destination === 'document') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      })
      .catch(() => {
        // Offline fallback — serve cached version or index.html
        return caches.match(request).then(
          (cached) => cached || caches.match('/index.html')
        );
      })
  );
});
