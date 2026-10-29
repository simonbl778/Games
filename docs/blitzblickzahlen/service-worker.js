/* Increase VERSION whenever any shipped game file changes. */
const VERSION = '1.1.0';
const CACHE_PREFIX = `blitzblickzahlen:${self.registration.scope}:`;
const CACHE_NAME = `${CACHE_PREFIX}${VERSION}`;
const ASSETS = [
  './', './index.html', './styles.css', './app.js', './game.js', './audio.js',
  './manifest.webmanifest', './icons/icon.svg', './icons/icon-192.png',
  './icons/icon-512.png', './icons/maskable-512.png'
];
const absolute = (path) => new URL(path, self.registration.scope).href;
const expectedUrls = new Set(ASSETS.map(absolute));

self.addEventListener('install', (event) => {
  // Installation only succeeds after the complete app has been saved.
  // Existing clients keep their version until the user accepts the update.
  event.waitUntil(caches.open(CACHE_NAME).then((cache) =>
    cache.addAll(ASSETS.map((path) => new Request(absolute(path), { cache: 'reload' })))
  ));
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME).map((key) => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin || !url.href.startsWith(self.registration.scope)) return;
  url.search = '';
  url.hash = '';
  if (!expectedUrls.has(url.href)) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(url.href);
    return cached || fetch(event.request);
  })());
});

self.addEventListener('message', (event) => {
  if (event.data?.type === 'ACTIVATE_UPDATE') event.waitUntil(self.skipWaiting());
  if (event.data?.type === 'OFFLINE_STATUS') {
    event.waitUntil((async () => {
      const cache = await caches.open(CACHE_NAME);
      const present = await Promise.all(ASSETS.map((asset) => cache.match(absolute(asset))));
      if (present.every(Boolean)) event.source?.postMessage({ type: 'OFFLINE_READY' });
    })());
  }
});
