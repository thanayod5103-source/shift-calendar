const CACHE = "shift-calendar-pwa-v14";
const APP_SHELL = [
  "./",
  "./index.html",
  "./calendar.html?v=20260816-2",
  "./install-helper.js?v=2",
  "./contrast-theme.css?v=20260816-1",
  "./manifest.webmanifest",
  "./icon-192.png",
  "./icon-512.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

async function enhanceHtml(response) {
  if (!response || !response.ok) return response;
  const type = response.headers.get("content-type") || "";
  if (!type.includes("text/html")) return response;
  const html = await response.text();
  let enhanced = html;
  if (!enhanced.includes("contrast-theme.css")) {
    enhanced = enhanced.replace(/<\/head>/i, '<link rel="stylesheet" href="./contrast-theme.css?v=20260816-1"><\/head>');
  }
  if (!enhanced.includes("./install-helper.js")) {
    enhanced = enhanced.replace(/<\/body>/i, '<script src="./install-helper.js?v=2"><\/script></body>');
  }
  return new Response(enhanced, {status: response.status, statusText: response.statusText, headers: response.headers});
}

self.addEventListener("fetch", event => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then(async response => {
          const enhanced = await enhanceHtml(response.clone());
          const cache = await caches.open(CACHE);
          cache.put(new Request(new URL("./index.html", self.location.href)), enhanced.clone()).catch(() => {});
          return enhanced;
        })
        .catch(() => caches.match(new Request(new URL("./index.html", self.location.href))).then(r => r || caches.match("./")))
    );
    return;
  }

  event.respondWith(
    caches.match(req).then(cached => cached || fetch(req).then(response => {
      if (response.ok) {
        caches.open(CACHE).then(cache => cache.put(req, response.clone())).catch(() => {});
      }
      return response;
    }))
  );
});
