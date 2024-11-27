self.addEventListener('install', (e) => {
    e.waitUntil(
      caches.open('swift-converter-cache').then((cache) => {
        return cache.addAll([
          '/',
          '/index.html',
          '/conversion.html',
          '/css/styles.css',
          '/js/main.js',
          '/images/logo.png'
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
  