// Minimal service worker — delegates full logic to service-worker.js
// This file is kept for backward compatibility only.
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open('swift-converter-cache-v1').then((cache) => {
      return cache.addAll([
        '/',
        '/index.html',
        '/imagetotext.html',
        '/pdftoword.html',
        '/pptxtopdf.html',
        '/qrgenerator.html',
        '/urlshortener.html',
        '/style.css'
      ]);
    })
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => {
      return response || fetch(e.request);
    })
  );
});
