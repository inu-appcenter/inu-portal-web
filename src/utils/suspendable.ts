import type { QueryClient } from "@tanstack/react-query";

/**
 * Tier 3 웜 웹뷰 풀: 이 웹뷰 인스턴스가 parked(숨김) 상태로 전환될 때 정지해야
 * 하는 구독(소켓/SSE/폴링/heartbeat 등)이 등록하는 작은 레지스트리.
 *
 * `bridgeChannel.on('setActive', ...)` 가 `suspendApp()`/`resumeApp()` 을 호출할
 * 때 등록된 항목을 전부 순회한다. visibility 를 무시하는 새 구독을 추가할 때는
 * 반드시 여기 등록해야 parked 상태에서도 비용이 발생하지 않는다.
 */
export type Suspendable = {
  suspend: () => void;
  resume: () => void;
};

const registry = new Set<Suspendable>();

/** 구독을 등록한다. 해제 함수를 반환한다 (컴포넌트 unmount 시 호출). */
export function registerSuspendable(entry: Suspendable): () => void {
  registry.add(entry);
  return () => {
    registry.delete(entry);
  };
}

let queryClient: QueryClient | null = null;

/** main.tsx 에서 생성된 QueryClient 를 주입한다 (suspend 시 cancel, resume 시 invalidate). */
export function setSuspendableQueryClient(client: QueryClient): void {
  queryClient = client;
}

// document.hidden/visibilityState 는 네이티브 게터라 직접 대입할 수 없다. 웜
// 인스턴스는 실제로는 화면 밖(off-screen)일 뿐 WKWebView 프로세스 자체는
// 계속 살아있어 브라우저 관점에서는 "visible"로 보고한다 — 그래서 configurable
// 게터로 덮어써 parked 상태를 흉내내고, resume 시 원본을 복원한다.
let originalHiddenDescriptor: PropertyDescriptor | undefined;
let originalVisibilityStateDescriptor: PropertyDescriptor | undefined;

function captureOriginalDescriptors(): void {
  if (originalHiddenDescriptor) return;
  originalHiddenDescriptor = Object.getOwnPropertyDescriptor(Document.prototype, "hidden");
  originalVisibilityStateDescriptor = Object.getOwnPropertyDescriptor(
    Document.prototype,
    "visibilityState",
  );
}

function forceHidden(): void {
  captureOriginalDescriptors();
  Object.defineProperty(document, "hidden", { configurable: true, get: () => true });
  Object.defineProperty(document, "visibilityState", { configurable: true, get: () => "hidden" });
  document.dispatchEvent(new Event("visibilitychange"));
}

function restoreVisibility(): void {
  if (originalHiddenDescriptor) {
    Object.defineProperty(document, "hidden", originalHiddenDescriptor);
  }
  if (originalVisibilityStateDescriptor) {
    Object.defineProperty(document, "visibilityState", originalVisibilityStateDescriptor);
  }
  document.dispatchEvent(new Event("visibilitychange"));
}

/** parked 전환(`setActive(false)`): visibility 강제 + 진행 쿼리 취소 + 등록 구독 전부 정지. */
export function suspendApp(): void {
  forceHidden();
  void queryClient?.cancelQueries();
  for (const entry of registry) entry.suspend();
}

/** reveal 전환(`setActive(true)`): 실제 visibility 복원 + 등록 구독 재개 + 전체 재검증. */
export function resumeApp(): void {
  restoreVisibility();
  for (const entry of registry) entry.resume();
  void queryClient?.invalidateQueries();
}
