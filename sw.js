const CACHE = "shift-calendar-pwa-v12";
const APP_SHELL = [
  "./",
  "./index.html",
  "./calendar.html?v=20260816-2",
  "./install-helper.js",
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

async function injectInstallHelper(response) {
  if (!response || !response.ok) return response;
  const type = response.headers.get("content-type") || "";
  if (!type.includes("text/html")) return response;
  const html = await response.text();
  if (html.includes("./install-helper.js") || html.includes("shiftCalendarInstallHelperV1")) {
    return new Response(html, {status: response.status, statusText: response.statusText, headers: response.headers});
  }
  const injected = html.replace(/<\\/body>/i, '<script src="./install-helper.js?v=1"></script></body>');
  return new Response(injected, {status: response.status, statusText: response.statusText, headers: response.headers});
}

self.addEventListener("fetch", event => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  const sameOrigin = url.origin === self.location.origin;
  if (!sameOrigin) return;

  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then(async response => {
          const enhanced = await injectInstallHelper(response.clone());
          const cache = await caches.open(CACHE);
          cache.put("./index.html", enhanced.clone()).catch(() => {});
          return enhanced;
        })
        .catch(() => caches.match("./index.html").then(r => r || caches.match("./")))
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
