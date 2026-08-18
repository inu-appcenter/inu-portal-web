import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import svgr from "vite-plugin-svgr";

function selfUpdateServiceWorker() {
  return {
    name: "self-update-service-worker",
    apply: "build" as const,
    generateBundle() {
      // The build id deliberately changes on every deployment. Browsers compare a
      // service worker byte-for-byte, so this makes each deployment observable.
      const buildId = new Date().toISOString();

      this.emitFile({
        type: "asset",
        fileName: "sw.js",
        source: `const BUILD_ID = ${JSON.stringify(buildId)};

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
`,
      });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tsconfigPaths(), svgr(), selfUpdateServiceWorker()],
  define: {
    global: "window",
  },
  server: {
    host: "0.0.0.0", // 모든 네트워크 인터페이스 바인딩
    port: 5173, // 포트 지정 (선택)
  },
});
