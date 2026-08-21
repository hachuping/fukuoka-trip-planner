const CACHE = "fukuoka-planner-v1";
const SHELL = [
  "/fukuoka-trip-planner/",
  "/fukuoka-trip-planner/index.html",
  "/fukuoka-trip-planner/manifest.webmanifest",
  "/fukuoka-trip-planner/icons/icon-192.png",
  "/fukuoka-trip-planner/icons/icon-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  // Keep external CDN requests network-based. Cache same-origin shell only.
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(req).then(cached => cached || fetch(req).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(cache => cache.put(req, copy));
      return res;
    }).catch(() => caches.match("/fukuoka-trip-planner/")))
  );
});
