// Minimaler Service Worker: macht die Seite installierbar und hält eine Kopie
// für den Fall ohne Netz. Immer zuerst aus dem Netz, damit jede neue Version
// sofort ankommt. Fremde Adressen (KI, Stimmen, Gerät) werden nie angefasst.
const CACHE = 'notizen-v1';
self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(['./', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png'])).catch(() => {}));
});
self.addEventListener('activate', (e) => { e.waitUntil(self.clients.claim()); });
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  e.respondWith(
    fetch(req).then((res) => {
      if (res && res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {}); }
      return res;
    }).catch(() => caches.match(req).then((r) => r || caches.match('./')))
  );
});
