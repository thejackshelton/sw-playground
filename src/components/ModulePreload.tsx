import { component$, sync$, useOnWindow } from "@builder.io/qwik";
import { isDev } from "@builder.io/qwik/build";

export const ModulePreload = component$(() => {
  useOnWindow(
    "DOMContentLoaded",
    sync$(async () => {
      const base = document.documentElement.getAttribute("q:base") ?? "/";
      
      // Initialize SW & cache
      if ("serviceWorker" in navigator && !document.querySelector('[q\\:render="ssr-dev"]')) {
        await navigator.serviceWorker.register("/sw.js");
        await navigator.serviceWorker.ready;
        const modules = document.querySelectorAll('link[rel="modulepreload"]');
        const controller = navigator.serviceWorker.controller;
        const hrefs = Array.from(modules).map(
          (link) => (link as HTMLLinkElement).href
        );
        controller?.postMessage({ type: "init", value: hrefs });
      }

      const getHref = (bundle: string) => {
        if (isDev) return bundle;
        return `${base}${bundle}`.replace(/\/\./g, "");
      }

      // Listen on prefetch event
      document.addEventListener("qprefetch", (event) => {
        const { bundles } = (event as CustomEvent).detail;
        if (!Array.isArray(bundles)) return;
        for (const bundle of bundles) {
          if ((window as any).supportsModulePreload) {
            const link = document.createElement("link");
            link.rel = "modulepreload";
            link.href = getHref(bundle);
            // TODO: use fetchpriority to priorize some bundles if needed
            document.body.appendChild(link);
          } else {
            // triggers the sw
            fetch(getHref(bundle));
          }
        }
      });
    })
  );

  return <link
    rel="modulepreload"
    href="/modulepreload-support.js"
    fetchPriority="high"
    onload="window.supportsModulePreload = true"
  />
})
