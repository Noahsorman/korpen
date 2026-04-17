const CACHE_NAME = 'unatletico_madrid-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/logo.png',
  // Lägg till dina CSS/JS-filer här om de har fasta namn
];

// Installera Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

// Hantera förfrågningar (Cache-first strategy)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});