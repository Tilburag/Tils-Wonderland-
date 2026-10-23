// Minimaler Service Worker: macht die Seite installierbar und hält eine Kopie
// für den Fall ohne Netz. Immer beim Server nachfragen (no-cache), damit jede neue
// Version sofort ankommt - unveränderte Dateien kommen dabei als kurze 304-Antwort.
// Fremde Adressen (KI, Stimmen, Gerät) werden nie angefasst.
const CACHE = 'notizen-v2';
self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(['./', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png'])).catch(() => {}));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  e.respondWith(
    fetch(req, { cache: 'no-cache' }).then((res) => {
      if (res && res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {}); }
      return res;
    }).catch(() => caches.match(req).then((r) => r || caches.match('./')))
  );
});
