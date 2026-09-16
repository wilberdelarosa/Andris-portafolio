/* Only same-origin public documents and immutable presentation assets are cached. */
const VERSION = "ap-v7";
const SHELL = `${VERSION}-shell`;
const ASSETS = `${VERSION}-assets`;
const PAGES = `${VERSION}-pages`;
const PRELOAD = [
  "/offline.html",
  "/derived/icon-192.png",
  "/derived/icon-512.png",
];
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(SHELL)
      .then((cache) => cache.addAll(PRELOAD))
      .then(() => self.skipWaiting()),
  );
});
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter(
              (key) =>
                key.startsWith("ap-") && ![SHELL, ASSETS, PAGES].includes(key),
            )
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});
async function remember(cacheName, request, response, limit) {
  if (!response.ok || response.type !== "basic") return;
  const cache = await caches.open(cacheName);
  await cache.put(request, response);
  const keys = await cache.keys();
  for (const key of keys.slice(0, Math.max(0, keys.length - limit)))
    await cache.delete(key);
}
function presentationRequest(input) {
  const request = new Request(input);
  if (new URL(request.url).pathname !== "/_next/image") return request;
  // Prewarming and browser image requests must negotiate the same alpha-safe
  // format; Next otherwise falls back to opaque JPEG for Accept: */*.
  const headers = new Headers(request.headers);
  headers.set("Accept", "image/webp");
  return new Request(request, { headers });
}
self.addEventListener("message", (event) => {
  if (
    event.data?.type !== "CACHE_PUBLIC_PAGE" ||
    !Array.isArray(event.data.resources)
  )
    return;
  event.waitUntil(
    (async () => {
      const page = new URL(event.data.page, self.location.origin);
      if (
        page.origin !== self.location.origin ||
        !["/", "/proyectos/melcon-paradise"].includes(page.pathname)
      )
        return;
      page.hash = "";
      const response = await fetch(page.href);
      if (
        response.ok &&
        response.headers.get("content-type")?.includes("text/html")
      )
        await remember(PAGES, page.href, response, 15);
      const urls = [...new Set(event.data.resources)]
        .slice(0, 100)
        .filter((value) => {
          try {
            const url = new URL(value);
            return (
              url.origin === self.location.origin &&
              (url.pathname.startsWith("/_next/static/") ||
                url.pathname.startsWith("/derived/") ||
                url.pathname === "/_next/image")
            );
          } catch {
            return false;
          }
        });
      await Promise.allSettled(
        urls.map(async (url) => {
          const request = presentationRequest(url);
          const response = await fetch(request);
          await remember(ASSETS, request, response, 100);
        }),
      );
    })().catch(() => {}),
  );
});
self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (
    request.method !== "GET" ||
    url.origin !== self.location.origin ||
    url.pathname.startsWith("/api/") ||
    request.headers.get("RSC") === "1" ||
    url.searchParams.has("_rsc")
  )
    return;
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (
            response.ok &&
            response.headers.get("content-type")?.includes("text/html")
          )
            event.waitUntil(remember(PAGES, request, response.clone(), 15));
          return response;
        })
        .catch(
          async () =>
            (await caches.match(request, { ignoreVary: true })) ||
            (await caches.match("/offline.html")),
        ),
    );
    return;
  }
  if (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/derived/") ||
    url.pathname === "/_next/image"
  ) {
    const assetRequest = presentationRequest(request);
    const matchOptions =
      url.pathname === "/_next/image" ? undefined : { ignoreVary: true };
    event.respondWith(
      caches.match(assetRequest, matchOptions).then(
        (hit) =>
          hit ||
          fetch(assetRequest).then((response) => {
            event.waitUntil(remember(ASSETS, assetRequest, response.clone(), 100));
            return response;
          }),
      ),
    );
  }
});
