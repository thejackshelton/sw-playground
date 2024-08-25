import { sync$, component$, useOnWindow } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { Counter } from "~/components/counter/counter";

export default component$(() => {
  useOnWindow(
    "DOMContentLoaded",
    sync$(async () => {
      if (document.querySelector('[q\\:render="ssr-dev"]')) return;
      if (!("serviceWorker" in navigator)) return;
      const base = document.documentElement.getAttribute("q:base") ?? "/";
      await navigator.serviceWorker.register("sw.js");
      await navigator.serviceWorker.ready;
      const modules = document.querySelectorAll('link[rel="modulepreload"]');
      const controller = navigator.serviceWorker.controller;

      // Initialize cache
      const hrefs = Array.from(modules).map(
        (link) => (link as HTMLLinkElement).href
      );
      controller?.postMessage({ type: "cache", value: hrefs });

      // Listen on prefetch event
      document.addEventListener("qprefetch", (event) => {
        const { bundles } = (event as CustomEvent).detail;
        console.log(bundles);
        if (!Array.isArray(bundles)) return;
        for (const bundle of bundles) {
          const link = document.createElement("link");
          link.rel = "modulepreload";
          link.href = `${base}${bundle}`.replace(/\/\./g, "");
          document.body.appendChild(link);
        }
      });
    })
  );

  return (
    <>
      <h1>Hi 👋</h1>
      <div>
        Can't wait to see what you build with qwik!
        <br />
        Happy coding.
      </div>
      <Counter />
    </>
  );
});

export const head: DocumentHead = {
  title: "Welcome to Qwik",
  meta: [
    {
      name: "description",
      content: "Qwik site description",
    },
  ],
};
