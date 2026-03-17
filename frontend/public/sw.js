// A minimal service worker to satisfy PWA installation requirements.
self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  return self.clients.claim();
});

// We are not caching anything here, just acting as a passthrough.
self.addEventListener("fetch", (event) => {
  // Pass all requests to the network
  event.respondWith(fetch(event.request));
});
