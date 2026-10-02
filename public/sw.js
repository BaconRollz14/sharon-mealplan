const CACHE_NAME = "sharon-meal-plan-v2";
const CORE_ASSETS = [
  "/",
  "/manifest.webmanifest",
  "/favicon.svg",
  "/family-dinner-hero-720.webp",
  "/family-dinner-hero-720.avif",
];

const isImageRequest = (request) => {
  const url = new URL(request.url);
  return request.destination === "image" || url.pathname.startsWith("/meals/") || /^\/family-dinner-hero-\d+\.(?:avif|webp|png)$/.test(url.pathname);
};

const cacheResponse = (cache, request, response, event) => {
  if (response.ok) event.waitUntil(cache.put(request, response.clone()).catch(() => {}));
  return response;
};

const offlineResponse = async (cache, request) => {
  const cached = await cache.match(request);
  if (cached) return cached;
  if (request.mode === "navigate") return cache.match("/");
  return new Response("Offline", { status: 503, statusText: "Offline" });
};

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))),
    ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET" || new URL(event.request.url).origin !== self.location.origin) return;

  event.respondWith(caches.open(CACHE_NAME).then(async (cache) => {
    if (isImageRequest(event.request)) {
      const cached = await cache.match(event.request);
      if (cached) return cached;
      try {
        return cacheResponse(cache, event.request, await fetch(event.request), event);
      } catch {
        return offlineResponse(cache, event.request);
      }
    }

    try {
      return cacheResponse(cache, event.request, await fetch(event.request), event);
    } catch {
      return offlineResponse(cache, event.request);
    }
  }));
});
