const CACHE_NAME = "sk-egg-mart-v3";

// Only cache static assets — NEVER cache HTML pages
const STATIC_ASSETS = [
  "/static/css/style.css",
  "/static/js/customer.js",
  "/static/js/pwa.js",
  "/static/manifest.json",
  "/static/icons/icon-192.png",
  "/static/icons/icon-512.png",
];

// Install: pre-cache only static files
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activate: delete ALL old caches immediately
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch strategy:
// - HTML pages (/  /order  /order/success/...) → ALWAYS network (never cache)
// - API routes → always network
// - Static assets (.css .js .png) → cache-first
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  const isHTML = event.request.headers.get("accept")?.includes("text/html");
  const isAPI  = url.pathname.startsWith("/api/");
  const isAdmin = url.pathname.startsWith("/admin");

  if (isHTML || isAPI || isAdmin) {
    // Always go to network for pages and APIs
    event.respondWith(
      fetch(event.request).catch(() =>
        new Response("<h1>Offline</h1><p>Please reconnect.</p>", {
          headers: { "Content-Type": "text/html" },
        })
      )
    );
  } else {
    // Cache-first for CSS, JS, images
    event.respondWith(
      caches.match(event.request).then(
        (cached) =>
          cached ||
          fetch(event.request).then((response) => {
            if (response && response.status === 200 && url.pathname.startsWith("/static/")) {
              const clone = response.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
            }
            return response;
          })
      )
    );
  }
});
