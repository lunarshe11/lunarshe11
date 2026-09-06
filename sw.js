const CACHE_NAME = 'she11-v1';
const urlsToCache = [
    '/',
    'index.html',
    'cjs/style.css',
    'cjs/script.js',
    'i/pfp.jpg',
    'i/char.jpg',
    'https://unpkg.com/typed.js@2.0.16/dist/typed.umd.js',
    'https://cdnjs.cloudflare.com/ajax/libs/animejs/3.2.1/anime.min.js',
    'https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=DotGothic16&display=swap',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.filter(key => key !== CACHE_NAME)
                    .map(key => caches.delete(key))
            );
        }).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => response || fetch(event.request))
    );
});