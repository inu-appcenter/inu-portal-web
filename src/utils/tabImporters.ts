import { preloadableLazy } from "@/utils/preloadableLazy";

export const TAB_COMPONENTS = {
  timetable: preloadableLazy(() => import("@/pages/mobile/MobileTimeTablePage")),
  bus: preloadableLazy(() => import("@/pages/mobile/MobileBus/MobileBusPage")),
  chat: preloadableLazy(() => import("@/pages/mobile/MobileChatListPage")),
  mypage: preloadableLazy(() => import("@/pages/mobile/MobileMyPage")),
  save: preloadableLazy(() => import("@/pages/mobile/MobileSavePage")),
};

export type TabKey = keyof typeof TAB_COMPONENTS;

const TAB_ORDER: TabKey[] = ["timetable", "bus", "chat", "mypage", "save"];

let hasStartedPrefetch = false;

/**
 * 첫 렌더링 완료 후 빠른 직렬 체이닝으로 바텀바 탭 청크 순차 사전 로드
 * - 홈 화면 첫 페인트 직후(50ms) 가장 많이 방문하는 시간표 탭부터 즉시 로드 시작
 * - 5개를 한 번에 받지 않고 하나가 완료되면 다음 탭을 즉시 요청하여 대역폭 분산
 * - 사전 로드가 완료되면 React.lazy를 타지 않고 동기 컴포넌트로 즉시 렌더되어 스피너 깜빡임 0
 */
export async function prefetchMainTabs(): Promise<void> {
  if (hasStartedPrefetch) return;
  hasStartedPrefetch = true;

  // 홈 화면 마운트 및 첫 페인트 안정화 후 즉시 시작
  await new Promise((resolve) => setTimeout(resolve, 50));

  for (const key of TAB_ORDER) {
    try {
      await TAB_COMPONENTS[key].preload();
    } catch {
      // 사전 로드 실패 시 무시하고 다음 탭 계속 진행
    }
  }
}

/**
 * 탭 터치 시작 또는 마우스 오버 시 즉시 사전 로드
 */
export function prefetchTab(key: TabKey): void {
  if (TAB_COMPONENTS[key]) {
    void TAB_COMPONENTS[key].preload();
  }
}
