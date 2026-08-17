import type {
  PromotionDefinition,
  PromotionGlobalState,
  PromotionId,
  PromotionRecord,
  PromotionState,
} from "./types";

const HOUR_MS = 60 * 60 * 1000;
const KST_OFFSET_MS = 9 * HOUR_MS;

export interface PromotionLimits {
  /** 한 세션(페이지 로드)에 노출할 방해형 프로모션 수 */
  maxPerSession: number;
  /** 하루(KST)에 노출할 방해형 프로모션 수 */
  maxPerDay: number;
  /** 방해형 프로모션을 하나 띄운 뒤 다음 것까지의 최소 간격 */
  cooldownMs: number;
  /** `maxImpressions` 미지정 시 기본값 */
  defaultMaxImpressions: number;
  /** `snoozeMs` 미지정 시 기본값 */
  defaultSnoozeMs: number;
}

export const DEFAULT_PROMOTION_LIMITS: PromotionLimits = {
  maxPerSession: 1,
  maxPerDay: 2,
  cooldownMs: 6 * HOUR_MS,
  defaultMaxImpressions: 3,
  defaultSnoozeMs: 24 * HOUR_MS,
};

/** KST 기준 날짜 키. 하루 노출량을 집계하는 단위다. */
export function getDayKey(now: number) {
  return new Date(now + KST_OFFSET_MS).toISOString().slice(0, 10);
}

export function createEmptyRecord(): PromotionRecord {
  return {
    impressions: 0,
    lastShownAt: 0,
    snoozedUntil: 0,
    optedOut: false,
  };
}

export function createInitialState(): PromotionState {
  return {
    records: {},
    global: { lastShownAt: 0, dayKey: "", shownToday: 0 },
  };
}

export function getRecord(state: PromotionState, id: PromotionId) {
  return state.records[id] ?? createEmptyRecord();
}

function getMaxImpressions(
  definition: PromotionDefinition,
  limits: PromotionLimits,
) {
  return definition.maxImpressions ?? limits.defaultMaxImpressions;
}

export function isWithinSchedule(definition: PromotionDefinition, now: number) {
  if (definition.startsAt && now < Date.parse(definition.startsAt)) {
    return false;
  }

  if (definition.endsAt && now >= Date.parse(definition.endsAt)) {
    return false;
  }

  return true;
}

/** 다시는 노출하지 않는 상태(사용자가 써봤거나, 최대 노출 횟수를 채웠거나) */
export function isRetired(
  definition: PromotionDefinition,
  record: PromotionRecord,
  limits: PromotionLimits = DEFAULT_PROMOTION_LIMITS,
) {
  return (
    record.optedOut || record.impressions >= getMaxImpressions(definition, limits)
  );
}

/** 전역 빈도 제한을 빼고, 이 프로모션 하나만 놓고 봤을 때 노출 가능한지 */
export function isEligible(
  definition: PromotionDefinition,
  record: PromotionRecord,
  now: number,
  limits: PromotionLimits = DEFAULT_PROMOTION_LIMITS,
) {
  if (!isWithinSchedule(definition, now)) {
    return false;
  }

  if (isRetired(definition, record, limits)) {
    return false;
  }

  return now >= record.snoozedUntil;
}

/** 날짜가 바뀌었으면 0으로 리셋된 오늘 노출 수 */
export function getShownToday(global: PromotionGlobalState, now: number) {
  return global.dayKey === getDayKey(now) ? global.shownToday : 0;
}

/** 지금 방해형 프로모션을 하나 더 띄워도 되는지 */
export function isFrequencyCapOpen(
  global: PromotionGlobalState,
  now: number,
  sessionShownCount: number,
  limits: PromotionLimits = DEFAULT_PROMOTION_LIMITS,
) {
  if (sessionShownCount >= limits.maxPerSession) {
    return false;
  }

  if (getShownToday(global, now) >= limits.maxPerDay) {
    return false;
  }

  return (
    global.lastShownAt === 0 || now - global.lastShownAt >= limits.cooldownMs
  );
}

function comparePromotions(
  state: PromotionState,
  a: PromotionDefinition,
  b: PromotionDefinition,
) {
  const priorityDiff = (b.priority ?? 0) - (a.priority ?? 0);

  if (priorityDiff !== 0) {
    return priorityDiff;
  }

  // 덜 보여준 것부터 — 같은 우선순위끼리 노출을 고르게 나눈다.
  const impressionDiff =
    getRecord(state, a.id).impressions - getRecord(state, b.id).impressions;

  if (impressionDiff !== 0) {
    return impressionDiff;
  }

  return a.id.localeCompare(b.id);
}

/**
 * 후보 중 지금 띄울 방해형 프로모션 하나를 고른다.
 * 빈도 제한에 걸리거나 후보가 없으면 `null`.
 */
export function selectNextPromotion(
  candidates: PromotionDefinition[],
  state: PromotionState,
  now: number,
  sessionShownCount: number,
  limits: PromotionLimits = DEFAULT_PROMOTION_LIMITS,
): PromotionDefinition | null {
  if (!isFrequencyCapOpen(state.global, now, sessionShownCount, limits)) {
    return null;
  }

  const eligible = candidates.filter((definition) =>
    isEligible(definition, getRecord(state, definition.id), now, limits),
  );

  if (eligible.length === 0) {
    return null;
  }

  return eligible.reduce((best, candidate) =>
    comparePromotions(state, candidate, best) < 0 ? candidate : best,
  );
}

function withRecord(
  state: PromotionState,
  id: PromotionId,
  update: (record: PromotionRecord) => PromotionRecord,
): PromotionState {
  return {
    ...state,
    records: { ...state.records, [id]: update(getRecord(state, id)) },
  };
}

export function markShown(
  state: PromotionState,
  definition: PromotionDefinition,
  now: number,
): PromotionState {
  const next = withRecord(state, definition.id, (record) => ({
    ...record,
    impressions: record.impressions + 1,
    lastShownAt: now,
  }));

  // ambient는 방해가 아니므로 전역 빈도 예산을 쓰지 않는다.
  if (definition.surface === "ambient") {
    return next;
  }

  return {
    ...next,
    global: {
      lastShownAt: now,
      dayKey: getDayKey(now),
      shownToday: getShownToday(state.global, now) + 1,
    },
  };
}

/** 닫기(X) — 이번엔 넘기고 나중에 다시 기회를 준다. */
export function markSnoozed(
  state: PromotionState,
  definition: PromotionDefinition,
  now: number,
  limits: PromotionLimits = DEFAULT_PROMOTION_LIMITS,
): PromotionState {
  return withRecord(state, definition.id, (record) => ({
    ...record,
    snoozedUntil: now + (definition.snoozeMs ?? limits.defaultSnoozeMs),
  }));
}

/** 기능을 써봤거나 "다시 보지 않기" — 영구 종료. */
export function markOptedOut(
  state: PromotionState,
  id: PromotionId,
): PromotionState {
  return withRecord(state, id, (record) => ({ ...record, optedOut: true }));
}
