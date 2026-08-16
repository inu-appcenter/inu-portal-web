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
   * 최초 진입 시 신규 기능을 한 번에 소개하는 시트.
   * 우선순위를 가장 높게 둬서, 이게 뜬 세션에는 다른 툴팁이 겹치지 않는다.
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
