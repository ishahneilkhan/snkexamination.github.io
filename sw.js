/* SNK AI Academy — Service Worker (offline support) */
const CACHE = "snk-v1";
const PRECACHE = [
  "offline.html", "style.css", "script.js", "site-shell.js", "favicon.svg",
  "icons/icon-192.png", "icons/icon-512.png"
];

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE).then(c => Promise.all(PRECACHE.map(u => c.add(u).catch(() => {}))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

/* Network-first: সবসময় নতুন ভার্সন, নেট না থাকলে cache থেকে */
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;

  e.respondWith(
    fetch(req).then(res => {
      if (res && res.ok) {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy));
      }
      return res;
    }).catch(() =>
      caches.match(req).then(hit => hit || (req.mode === "navigate" ? caches.match("offline.html") : undefined))
    )
  );
});
