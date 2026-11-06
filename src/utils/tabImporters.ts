import { idlePrefetch, prefetchNow } from "@/utils/prefetch";

export const TAB_IMPORTERS = {
  timetable: () => import("@/pages/mobile/MobileTimeTablePage"),
  bus: () => import("@/pages/mobile/MobileBus/MobileBusPage"),
  chat: () => import("@/pages/mobile/MobileChatListPage"),
  mypage: () => import("@/pages/mobile/MobileMyPage"),
  save: () => import("@/pages/mobile/MobileSavePage"),
};

export type TabKey = keyof typeof TAB_IMPORTERS;

/**
 * 첫 렌더링 완료 후 브라우저 유휴 시간에 바텀바 탭 청크 순차 사전 로드
 */
export function prefetchMainTabs(): void {
  idlePrefetch(TAB_IMPORTERS.timetable, 1500);
  idlePrefetch(TAB_IMPORTERS.bus, 2000);
  idlePrefetch(TAB_IMPORTERS.chat, 2500);
  idlePrefetch(TAB_IMPORTERS.mypage, 3000);
  idlePrefetch(TAB_IMPORTERS.save, 3500);
}

/**
 * 탭 터치 시작 또는 마우스 오버 시 즉시 사전 로드
 */
export function prefetchTab(key: TabKey): void {
  if (TAB_IMPORTERS[key]) {
    prefetchNow(TAB_IMPORTERS[key]);
  }
}
