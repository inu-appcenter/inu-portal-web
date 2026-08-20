import { describe, expect, it, vi } from "vitest";

import { cleanupLegacyPwa } from "../pwaCleanup";

type Registration = Pick<ServiceWorkerRegistration, "scope" | "unregister">;

function fakeServiceWorker(registrations: Registration[]) {
  return {
    getRegistrations: vi.fn(
      async () => registrations as unknown as readonly ServiceWorkerRegistration[],
    ),
  };
}

function fakeRegistration(scope: string, unregisterResult = true): Registration {
  return {
    scope,
    unregister: vi.fn(async () => unregisterResult),
  };
}

function fakeCacheStorage(keys: string[]) {
  const remaining = new Set(keys);
  return {
    keys: vi.fn(async () => [...remaining]),
    delete: vi.fn(async (key: string) => remaining.delete(key)),
  };
}

describe("cleanupLegacyPwa", () => {
  it("서비스워커와 Cache Storage를 둘 다 못 쓰면 아무것도 하지 않는다", async () => {
    const result = await cleanupLegacyPwa({
      serviceWorker: null,
      cacheStorage: null,
    });

    expect(result.status).toBe("unsupported");
  });

  it("지울 게 없으면 clean — 이벤트를 남기지 않는 상태", async () => {
    const result = await cleanupLegacyPwa({
      serviceWorker: fakeServiceWorker([]),
      cacheStorage: fakeCacheStorage([]),
    });

    expect(result).toMatchObject({
      status: "clean",
      unregisteredCount: 0,
      deletedCacheCount: 0,
      scopes: [],
    });
  });

  it("남아 있는 등록을 모두 해제하고 캐시를 전부 지운다", async () => {
    const registration = fakeRegistration("https://intip.inuappcenter.kr/");
    const serviceWorker = fakeServiceWorker([registration]);
    const cacheStorage = fakeCacheStorage(["workbox-precache-v2", "assets"]);

    const result = await cleanupLegacyPwa({ serviceWorker, cacheStorage });

    expect(registration.unregister).toHaveBeenCalledTimes(1);
    expect(cacheStorage.delete).toHaveBeenCalledTimes(2);
    expect(result).toMatchObject({
      status: "cleaned",
      unregisteredCount: 1,
      deletedCacheCount: 2,
      scopes: ["https://intip.inuappcenter.kr/"],
    });
  });

  it("워커는 없고 캐시만 남아 있어도 정리 대상이다", async () => {
    const result = await cleanupLegacyPwa({
      serviceWorker: fakeServiceWorker([]),
      cacheStorage: fakeCacheStorage(["workbox-runtime"]),
    });

    expect(result).toMatchObject({
      status: "cleaned",
      unregisteredCount: 0,
      deletedCacheCount: 1,
    });
  });

  it("해제가 거부되면(false) 지운 것으로 세지 않는다", async () => {
    const result = await cleanupLegacyPwa({
      serviceWorker: fakeServiceWorker([fakeRegistration("/", false)]),
      cacheStorage: fakeCacheStorage([]),
    });

    expect(result).toMatchObject({ status: "clean", unregisteredCount: 0 });
  });

  it("조회 중 예외가 나면 failed로 감싼다 — 부팅을 막지 않는다", async () => {
    const error = new DOMException("보안 오류", "SecurityError");
    const result = await cleanupLegacyPwa({
      serviceWorker: {
        getRegistrations: vi.fn(async () => {
          throw error;
        }),
      },
      cacheStorage: fakeCacheStorage(["assets"]),
    });

    expect(result.status).toBe("failed");
    expect(result.error).toBe(error);
  });
});
