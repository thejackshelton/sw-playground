const main = async () => {
  let cache;

  const fetchResponse = async (req) => {
    // Check cache
    const cachedResponse = await caches.match(req);
    if (cachedResponse) return cachedResponse;

    // Cache and return reponse
    return fetch(req).then((res) => {
      if (req.url.includes("q-") && req.url.endsWith('.js')) {
        cache.put(req, res.clone());
      }
      return res;
    })
  }

  self.addEventListener("activate", async (event) => {
    cache ||= await caches.open("QwikModulePreload");
  });
  self.addEventListener("message", async (message) => {
    cache ||= await caches.open("QwikModulePreload");
    if (message.data.type === "init") {
      new Set(message.data.value).forEach(url => {
        return fetchResponse(new Request(url, { cache: 'force-cache' }));
      });
    }
  });
  self.addEventListener("fetch", async (event) => {
    cache ||= await caches.open("QwikModulePreload");
    event.respondWith(fetchResponse(event.request));
  });
};
main();
addEventListener("install", () => self.skipWaiting());
addEventListener("activate", () => self.clients.claim());
