// Basit service worker: uygulama kabuğunu önbelleğe alır (PWA kurulumu için yeterli).
const CACHE = "hali-takip-v1";
const SHELL = ["/", "/style.css", "/app.js", "/icon.svg", "/manifest.webmanifest"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)));
  self.skipWaiting();
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))));
});
self.addEventListener("fetch", (e) => {
  // API istekleri her zaman ağdan; kabuk dosyaları ağ yoksa önbellekten.
  if (e.request.url.includes("/api/")) return;
  e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
});
