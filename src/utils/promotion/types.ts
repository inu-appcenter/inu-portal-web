export type PromotionId = string;

/**
 * 프로모션이 놓이는 자리의 성격. 전역 빈도 제한(큐) 참여 여부를 가른다.
 *
 * - `interruptive`: 툴팁·배너처럼 사용자가 하려던 일을 가로채는 자리.
 *   한 번에 하나만 뜨도록 큐가 중재한다.
 * - `ambient`: 빈 상태 CTA처럼 어차피 비어 있는 자리를 채우는 것.
 *   방해가 아니므로 큐를 거치지 않고 개별 조건만 만족하면 바로 노출한다.
 */
export type PromotionSurface = "interruptive" | "ambient";

export interface PromotionDefinition {
  id: PromotionId;
  /** Mixpanel `location` 값 */
  location: string;
  /** 기본값 `"interruptive"` */
  surface?: PromotionSurface;
  /** 클수록 먼저 노출된다. 기본값 0 */
  priority?: number;
  /** ISO 문자열. 이 시각 이전에는 노출하지 않는다. */
  startsAt?: string;
  /** ISO 문자열. 이 시각 이후에는 노출하지 않는다. */
  endsAt?: string;
  /** 이 횟수만큼 노출되면 영구 종료. 기본값은 정책 기본값 */
  maxImpressions?: number;
  /** 닫기(스누즈) 후 다시 뜨기까지의 시간(ms). 기본값은 정책 기본값 */
  snoozeMs?: number;
  /**
   * Mixpanel에 보낼 프로모션 이름. 기존 지표와의 연속성이 필요할 때만 지정한다.
   * 기본값은 `id`.
   */
  analyticsName?: string;
}

export interface PromotionRecord {
  /** 지금까지 노출된 횟수 */
  impressions: number;
  /** 마지막 노출 시각(epoch ms) */
  lastShownAt: number;
  /** 이 시각까지는 다시 노출하지 않는다(epoch ms) */
  snoozedUntil: number;
  /** 사용자가 기능을 써봤거나 "다시 보지 않기"를 눌러 영구 종료된 상태 */
  optedOut: boolean;
}

export interface PromotionGlobalState {
  /** 마지막으로 방해형 프로모션을 노출한 시각(epoch ms) */
  lastShownAt: number;
  /** `shownToday`가 집계된 날짜(KST, YYYY-MM-DD) */
  dayKey: string;
  /** `dayKey` 하루 동안 노출한 방해형 프로모션 수 */
  shownToday: number;
}

export interface PromotionState {
  records: Record<PromotionId, PromotionRecord>;
  global: PromotionGlobalState;
}
