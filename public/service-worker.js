// НЕПРАВИЛЬНО - сервис-воркер вставлен в середину app.js
// Добавьте service worker для офлайн-работы
// service-worker.js
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open('teashop-v1').then(cache => {
            return cache.addAll([
                '/',
                '/index.html',
                '/style.css',
                '/app.js',
                '/manifest.json'
            ]);
        })
    );
});
