import { prefetchNow } from "@/utils/prefetch";

export const TAB_IMPORTERS = {
  timetable: () => import("@/pages/mobile/MobileTimeTablePage"),
  bus: () => import("@/pages/mobile/MobileBus/MobileBusPage"),
  chat: () => import("@/pages/mobile/MobileChatListPage"),
  mypage: () => import("@/pages/mobile/MobileMyPage"),
  save: () => import("@/pages/mobile/MobileSavePage"),
};

export type TabKey = keyof typeof TAB_IMPORTERS;

const TAB_ORDER: TabKey[] = ["timetable", "bus", "chat", "mypage", "save"];

let hasStartedPrefetch = false;

/**
 * 첫 렌더링 완료 후 빠른 직렬 체이닝으로 바텀바 탭 청크 순차 사전 로드
 * - 홈 초기 렌더링 및 주요 API 요청 안정화를 위해 300ms 후 시작
 * - 5개를 한 번에 받지 않고 하나가 완료되면 다음 탭을 즉시 요청하여 대역폭 분산
 */
export async function prefetchMainTabs(): Promise<void> {
  if (hasStartedPrefetch) return;
  hasStartedPrefetch = true;

  await new Promise((resolve) => setTimeout(resolve, 300));

  for (const key of TAB_ORDER) {
    await prefetchNow(TAB_IMPORTERS[key]);
  }
}

/**
 * 탭 터치 시작 또는 마우스 오버 시 즉시 사전 로드
 */
export function prefetchTab(key: TabKey): void {
  if (TAB_IMPORTERS[key]) {
    void prefetchNow(TAB_IMPORTERS[key]);
  }
}

