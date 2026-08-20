/**
 * PWA 잔재(서비스워커 등록 + Cache Storage) 정리.
 *
 * 배경 — 이 앱은 예전에 PWA였고, PWA를 걷어낼 때(a11f5362) 이미 설치된 서비스워커까지는
 * 정리하지 못했다. 남은 워커/캐시 탓에 앱 웹뷰가 배포 후에도 옛 자원을 물고 있어 화면이
 * 갱신되지 않았고, 1단계 핫픽스(70238fe4)로 배포마다 캐시를 비우는 임시 워커를 등록했다.
 * 이 파일은 2단계 — 그 임시 워커까지 포함해 서비스워커를 완전히 없앤다.
 *
 * 회수 경로는 둘이다.
 * 1. 이 파일 — 새 번들을 받은 클라이언트가 직접 등록을 해제하고 캐시를 지운다.
 * 2. `public/sw.js` — 아직 옛 번들을 물고 있어 `/sw.js`를 계속 등록하는 클라이언트용
 *    묘비 워커. 활성화되자마자 스스로 등록을 해제한다.
 *
 * Mixpanel `[PWA] 잔재 정리 완료` 이벤트가 사실상 0이 되면(= 아직 워커를 물고 있는
 * 사용자가 없으면) `public/sw.js`와 이 파일을 함께 지워도 된다. 그때가 PWA 제거의 끝이다.
 */

import { mixpanelTrack } from "./mixpanel";

export type PwaCleanupStatus =
  /** 서비스워커·Cache Storage를 쓸 수 없는 환경(비보안 오리진 등) */
  | "unsupported"
  /** 지울 게 없었다 — 정리가 끝난 정상 상태 */
  | "clean"
  /** 실제로 등록이나 캐시를 지웠다 */
  | "cleaned"
  /** 조회·삭제 도중 예외 */
  | "failed";

export interface PwaCleanupResult {
  status: PwaCleanupStatus;
  unregisteredCount: number;
  deletedCacheCount: number;
  /** 어떤 스코프의 워커가 남아 있었는지 — 잔재의 출처를 구분하기 위해 남긴다. */
  scopes: string[];
  error?: unknown;
}

/**
 * 전역 대신 주입받는다. 테스트에서 가짜 구현을 넣기 위함이자, 환경에 따라 둘 중 하나만
 * 존재할 수 있기 때문이다.
 */
export interface PwaCleanupDeps {
  serviceWorker?: Pick<ServiceWorkerContainer, "getRegistrations"> | null;
  cacheStorage?: Pick<CacheStorage, "keys" | "delete"> | null;
}

/**
 * 남아 있는 서비스워커 등록을 해제하고 Cache Storage를 비운다.
 *
 * 이 앱은 Cache API를 직접 쓰는 곳이 없다. 따라서 남아 있는 캐시는 전부 PWA 시절
 * 잔재이므로 전량 삭제해도 된다.
 */
export async function cleanupLegacyPwa({
  serviceWorker,
  cacheStorage,
}: PwaCleanupDeps): Promise<PwaCleanupResult> {
  if (!serviceWorker && !cacheStorage) {
    return {
      status: "unsupported",
      unregisteredCount: 0,
      deletedCacheCount: 0,
      scopes: [],
    };
  }

  try {
    const registrations = serviceWorker
      ? await serviceWorker.getRegistrations()
      : [];
    const scopes = registrations.map((registration) => registration.scope);
    const unregistered = await Promise.all(
      registrations.map((registration) => registration.unregister()),
    );
    const unregisteredCount = unregistered.filter(Boolean).length;

    const cacheKeys = cacheStorage ? await cacheStorage.keys() : [];
    const deleted = cacheStorage
      ? await Promise.all(cacheKeys.map((key) => cacheStorage.delete(key)))
      : [];
    const deletedCacheCount = deleted.filter(Boolean).length;

    return {
      status: unregisteredCount + deletedCacheCount > 0 ? "cleaned" : "clean",
      unregisteredCount,
      deletedCacheCount,
      scopes,
    };
  } catch (error) {
    return {
      status: "failed",
      unregisteredCount: 0,
      deletedCacheCount: 0,
      scopes: [],
      error,
    };
  }
}

function toErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

/**
 * 앱 부팅 시 한 번 호출한다(`main.tsx`). 실패해도 앱 동작에는 영향이 없으므로
 * 결과를 기다리지 않는다.
 *
 * 로깅은 실제로 지운 게 있을 때(`cleaned`)와 실패했을 때만 남긴다. 정리가 끝난
 * 사용자는 매 방문 `clean`이라 이벤트를 남기면 노이즈만 커진다.
 */
export function startPwaCleanup(): void {
  if (typeof navigator === "undefined") return;

  // 등록 해제 뒤에도 이 페이지는 언로드 전까지 제어를 받는다. 해제 후에 읽으면 항상
  // 값이 남아 있어 의미가 없으므로, 워커가 실제로 이 페이지를 잡고 있었는지는 지금 찍는다.
  const hadController = Boolean(navigator.serviceWorker?.controller);

  void cleanupLegacyPwa({
    serviceWorker: "serviceWorker" in navigator ? navigator.serviceWorker : null,
    cacheStorage: typeof caches !== "undefined" ? caches : null,
  }).then((result) => {
    if (result.status === "failed") {
      console.warn("[pwaCleanup] 서비스워커/캐시 정리 실패:", result.error);
      mixpanelTrack.pwaCleanupFailed({
        hadController,
        errorMessage: toErrorMessage(result.error),
      });
      return;
    }

    if (result.status !== "cleaned") return;

    mixpanelTrack.pwaCleanupCompleted({
      hadController,
      unregisteredCount: result.unregisteredCount,
      deletedCacheCount: result.deletedCacheCount,
      scopes: result.scopes,
    });
  });
}
