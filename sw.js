/* Mise en Place — Service Worker v132 */
const CACHE = "mep-v132";
const OFFLINE_URL = "/app-mobile.html";

const PRECACHE = [
  "/app-mobile.html",
  "/app-desktop.html",
  "/styles/tokens.css?v=96",
  "/styles/app.css?v=96",
  "/styles/screens.css?v=129",
  "/js/api.js?v=131",
  "/js/data.js?v=96",
  "/js/store.js?v=119",
  "/js/icons.jsx?v=96",
  "/js/components.jsx?v=96",
  "/js/slot-editor.jsx?v=119",
  "/js/screens-today.jsx?v=118",
  "/js/screens-week.jsx?v=129",
  "/js/screens-groceries.jsx?v=119",
  "/js/screens-recipes.jsx?v=127",
  "/js/screens-profile.jsx?v=96",
  "/js/share.jsx?v=96",
  "/js/app.jsx?v=105",
  "/js/auth-ui.js?v=132",
  "/favicon.svg",
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);

  // API calls: network-first, no caching
  if (url.hostname.includes("onrender.com") || url.pathname.startsWith("/auth") || url.pathname.startsWith("/recipes") || url.pathname.startsWith("/meal-plans") || url.pathname.startsWith("/scraper")) {
    e.respondWith(fetch(e.request).catch(() => new Response(JSON.stringify({ detail: "Offline" }), { status: 503, headers: { "Content-Type": "application/json" } })));
    return;
  }

  // Static assets: cache-first, fall back to network
  e.respondWith(
    caches.match(e.request).then((cached) => {
      const networkFetch = fetch(e.request).then((res) => {
        if (res.ok) {
          const clone = res.clone();
          caches.open(CACHE).then((c) => c.put(e.request, clone));
        }
        return res;
      });
      return cached || networkFetch;
    })
  );
});
