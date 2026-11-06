import { ComponentType, lazy, LazyExoticComponent } from "react";

const CHUNK_RELOAD_KEY = "chunk_reload_retry";

/**
 * 신규 배포 시 구버전 해시 청크 404(ChunkLoadError)로 인한 크래시를 방지하고
 * 1회 자동으로 페이지를 새로고침하여 최신 번들을 받아오는 지연 로딩 래퍼
 */
export function lazyWithRetry<P = Record<string, unknown>>(
  factory: () => Promise<{ default: ComponentType<P> }>,
): LazyExoticComponent<ComponentType<P>> {
  return lazy(async () => {
    const hasRetried = typeof window !== "undefined" && window.sessionStorage.getItem(CHUNK_RELOAD_KEY) === "true";

    try {
      const module = await factory();
      if (typeof window !== "undefined") {
        window.sessionStorage.removeItem(CHUNK_RELOAD_KEY);
      }
      return module;
    } catch (error) {
      if (!hasRetried && typeof window !== "undefined") {
        window.sessionStorage.setItem(CHUNK_RELOAD_KEY, "true");
        try {
          const url = new URL(window.location.href);
          url.searchParams.set("_reload", String(Date.now()));
          window.location.replace(url.toString());
        } catch {
          window.location.reload();
        }
        return new Promise(() => {});
      }

      if (typeof window !== "undefined") {
        window.sessionStorage.removeItem(CHUNK_RELOAD_KEY);
      }
      throw error;
    }
  });
}
