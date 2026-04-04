// CACHE_NAME for Oasis P2P
const CACHE_NAME = 'oasis-v1';

self.addEventListener('install', (event: any) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Don't block install on cache, but keep core ready
      return cache.addAll(['/']);
    })
  );
});

self.addEventListener('fetch', (event: any) => {
  // Simple network-first for real-time commerce
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});
