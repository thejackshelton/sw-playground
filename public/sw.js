const main = async () => {
  let cache;
  self.addEventListener("activate", async () => {
    cache ||= await caches.open("QwikModulePreload");
  });
  self.addEventListener("message", async (message) => {
    cache ||= await caches.open("QwikModulePreload");
    if (message.data.type === "init") {
      const bundles = Array.from(new Set(message.data.value));
      cache.addAll(bundles);
    }
  });
  self.addEventListener("fetch", async (event) => {
    const req = event.request;
    const match = await cache.match(req);
    if (match) {
      event.respondWith(match);
    } else {
      event.respondWith(
        fetch(req).then((res) => {
          if (req.url.includes("q-")) {
            cache.put(req, res.clone());
          }
          return res;
        })
      );
    }
  });
};
main();
addEventListener("install", () => self.skipWaiting());
addEventListener("activate", () => self.clients.claim());
