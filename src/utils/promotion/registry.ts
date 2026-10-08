import type { PromotionDefinition } from "./types";

/**
 * 앱 전체의 프로모션 카탈로그.
 *
 * 새 기능 안내를 추가할 때는 여기에 정의를 먼저 넣고, 화면에서는
 * `usePromotion(PROMOTIONS.X)`로 꺼내 쓴다. 한곳에 모아 두어야
 * 지금 몇 개가 켜져 있고 서로 어떤 순서로 경쟁하는지 한눈에 보인다.
 *
 * - `priority`: 기간이 정해진 안내(수강신청·축제 등)를 상시 안내보다 위에 둔다.
 * - `analyticsName`: 이미 집계 중인 이름이 따로 있을 때만 지정한다.
 */
export const PROMOTIONS = {
  /**
   * 수업 15분 전부터 잠금화면·다이내믹 아일랜드(안드로이드는 상단 알림바)에
   * 실시간 수업 카드를 띄우는 기능 소개 시트. 앱 3.0.14+ 최초 1회.
   * iOS는 첫 카드가 뜰 때 시스템 허용 팝업이 나오므로, 그보다 먼저 보여줘야
   * "허용"을 누르라는 안내가 의미가 있다. 그래서 다른 시트보다 우선한다.
   */
  LIVE_ACTIVITY: {
    id: "live-activity-intro",
    location: "Live Activity Sheet",
    priority: 120,
    maxImpressions: 1,
  },
  /**
   * 앱에서 포털·도서관·이러닝 정보를 자동으로 불러오는 기능 소개 시트.
   * 이 기능이 들어간 앱(3.0.14+)에서만 의미가 있어서, 그 버전으로 처음 들어온
   * 사람에게 신규 기능 안내보다 먼저 한 번만 보여준다.
   * "봤는지"는 `promotionSeenStorage`(PORTAL_AUTO_SYNC_INTRO)가 판정한다.
   */
  PORTAL_AUTO_SYNC: {
    id: "portal-auto-sync-intro",
    location: "Portal Auto Sync Sheet",
    priority: 110,
    maxImpressions: 1,
  },
  /**
   * 최초 진입 시 신규 기능을 한 번에 소개하는 시트.
   * 위의 앱 기능 소개 시트들 다음으로 우선순위를 높게 둬서, 이게 뜬 세션에는
   * 다른 툴팁이 겹치지 않는다.
   * 실수로 닫은 사람을 위해 사흘 뒤 한 번만 더 기회를 준다.
   */
  FEATURE_TOUR: {
    id: "feature-tour-2026",
    location: "Feature Tour",
    priority: 100,
    maxImpressions: 2,
    snoozeMs: 3 * 24 * 60 * 60 * 1000,
  },
  TIMETABLE_WIZARD: {
    id: "timetable-wizard",
    location: "시간표 편집 헤더",
    priority: 30,
  },
  TIMETABLE_UPDATE: {
    id: "timetable-update-2026-08",
    location: "Bottom Nav",
    priority: 20,
    startsAt: "2026-08-04T16:00:00+09:00",
  },
  HOME_FESTIVAL: {
    id: "home-festival-2026",
    location: "Home Chip Group",
    analyticsName: "Festival Tooltip",
    priority: 10,
  },
  SCHOOL_NOTICE: {
    id: "school-notice-tooltip",
    location: "Home Category",
  },
  ACADEMIC_CALENDAR: {
    id: "academic-calendar-tooltip",
    location: "Home Category",
  },
} satisfies Record<string, PromotionDefinition>;

export type PromotionKey = keyof typeof PROMOTIONS;
