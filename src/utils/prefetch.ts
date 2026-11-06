const prefetchedSet = new WeakSet<() => Promise<unknown>>();

interface NetworkInformationLike {
  saveData?: boolean;
}

function shouldSkipPrefetch(): boolean {
  if (typeof navigator === "undefined") return true;
  const connection = (navigator as unknown as { connection?: NetworkInformationLike }).connection;
  return Boolean(connection?.saveData);
}

/**
 * 탭 클릭 직전(호버, 터치 시작)에 모듈을 즉시 비동기 로드
 */
export function prefetchNow(factory: () => Promise<unknown>): void {
  if (shouldSkipPrefetch()) return;
  if (prefetchedSet.has(factory)) return;
  prefetchedSet.add(factory);

  try {
    void factory().catch(() => {
      // 사전 로딩 실패 시 실제 진입 시점에 lazyWithRetry가 다시 시도하도록 세트에서 제거
      prefetchedSet.delete(factory);
    });
  } catch {
    prefetchedSet.delete(factory);
  }
}

/**
 * 브라우저 유휴 시간(requestIdleCallback)에 백그라운드로 모듈 사전 로드
 */
export function idlePrefetch(factory: () => Promise<unknown>, timeout = 2500): void {
  if (typeof window === "undefined" || shouldSkipPrefetch()) return;
  if (prefetchedSet.has(factory)) return;

  const run = () => {
    prefetchNow(factory);
  };

  if ("requestIdleCallback" in window) {
    (window as unknown as { requestIdleCallback: (cb: () => void, opts?: { timeout: number }) => void }).requestIdleCallback(
      run,
      { timeout },
    );
  } else {
    setTimeout(run, 1200);
  }
}
