import { describe, expect, it } from "vitest";

import {
  DEFAULT_PROMOTION_LIMITS,
  createInitialState,
  getDayKey,
  getRecord,
  isEligible,
  isFrequencyCapOpen,
  markOptedOut,
  markShown,
  markSnoozed,
  selectNextPromotion,
} from "../promotion/policy";
import type { PromotionDefinition, PromotionState } from "../promotion/types";

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

/** 2026-08-11 12:00 KST */
const NOW = Date.parse("2026-08-11T12:00:00+09:00");

const banner: PromotionDefinition = {
  id: "banner",
  location: "Home",
};

const highPriorityBanner: PromotionDefinition = {
  id: "high-priority-banner",
  location: "Home",
  priority: 10,
};

const emptyStateCta: PromotionDefinition = {
  id: "empty-state-cta",
  location: "Timetable",
  surface: "ambient",
};

function stateWith(records: PromotionState["records"]): PromotionState {
  return { ...createInitialState(), records };
}

describe("promotion policy", () => {
  describe("getDayKey", () => {
    it("KST 기준으로 날짜를 나눈다", () => {
      expect(getDayKey(Date.parse("2026-08-11T23:59:00+09:00"))).toBe(
        "2026-08-11",
      );
      expect(getDayKey(Date.parse("2026-08-12T00:01:00+09:00"))).toBe(
        "2026-08-12",
      );
    });
  });

  describe("isEligible", () => {
    it("노출 기간 전이면 노출하지 않는다", () => {
      const scheduled = { ...banner, startsAt: "2026-08-12T00:00:00+09:00" };

      expect(isEligible(scheduled, getRecord(createInitialState(), banner.id), NOW)).toBe(
        false,
      );
    });

    it("노출 기간이 끝났으면 노출하지 않는다", () => {
      const expired = { ...banner, endsAt: "2026-08-11T00:00:00+09:00" };

      expect(isEligible(expired, getRecord(createInitialState(), banner.id), NOW)).toBe(
        false,
      );
    });

    it("최대 노출 횟수를 채우면 영구 종료된다", () => {
      const state = markShown(markShown(createInitialState(), banner, NOW), banner, NOW);
      const limited = { ...banner, maxImpressions: 2 };

      expect(isEligible(limited, getRecord(state, banner.id), NOW)).toBe(false);
    });

    it("닫은 직후에는 스누즈되지만 기간이 지나면 다시 노출된다", () => {
      const state = markSnoozed(createInitialState(), banner, NOW);
      const record = getRecord(state, banner.id);

      expect(isEligible(banner, record, NOW + HOUR_MS)).toBe(false);
      expect(
        isEligible(banner, record, NOW + DEFAULT_PROMOTION_LIMITS.defaultSnoozeMs),
      ).toBe(true);
    });

    it("영구 종료된 프로모션은 스누즈가 끝나도 노출되지 않는다", () => {
      const state = markOptedOut(createInitialState(), banner.id);

      expect(isEligible(banner, getRecord(state, banner.id), NOW + DAY_MS * 30)).toBe(
        false,
      );
    });
  });

  describe("isFrequencyCapOpen", () => {
    it("세션당 한도를 넘으면 닫힌다", () => {
      const { global } = createInitialState();

      expect(isFrequencyCapOpen(global, NOW, 0)).toBe(true);
      expect(isFrequencyCapOpen(global, NOW, 1)).toBe(false);
    });

    it("직전 노출로부터 쿨다운이 지나지 않으면 닫힌다", () => {
      const { global } = markShown(createInitialState(), banner, NOW);

      expect(isFrequencyCapOpen(global, NOW + HOUR_MS, 0)).toBe(false);
      expect(
        isFrequencyCapOpen(global, NOW + DEFAULT_PROMOTION_LIMITS.cooldownMs, 0),
      ).toBe(true);
    });

    it("하루 한도를 채우면 쿨다운이 지나도 닫혀 있다", () => {
      const limits = { ...DEFAULT_PROMOTION_LIMITS, maxPerDay: 2 };
      // 세 번의 시점이 모두 같은 KST 날짜 안에 들어오도록 새벽에서 시작한다.
      const dayStart = Date.parse("2026-08-11T00:30:00+09:00");
      const first = markShown(createInitialState(), banner, dayStart);
      const second = markShown(first, highPriorityBanner, dayStart + limits.cooldownMs);
      const later = dayStart + limits.cooldownMs * 2;

      expect(getDayKey(later)).toBe("2026-08-11");
      expect(isFrequencyCapOpen(second.global, later, 0, limits)).toBe(false);
    });

    it("날짜가 바뀌면 하루 한도가 리셋된다", () => {
      const limits = { ...DEFAULT_PROMOTION_LIMITS, maxPerDay: 1 };
      const state = markShown(createInitialState(), banner, NOW);

      expect(isFrequencyCapOpen(state.global, NOW + DAY_MS, 0, limits)).toBe(true);
    });
  });

  describe("selectNextPromotion", () => {
    it("우선순위가 높은 것을 먼저 고른다", () => {
      const selected = selectNextPromotion(
        [banner, highPriorityBanner],
        createInitialState(),
        NOW,
        0,
      );

      expect(selected?.id).toBe(highPriorityBanner.id);
    });

    it("우선순위가 같으면 덜 보여준 것을 고른다", () => {
      const other = { ...banner, id: "other-banner" };
      const state = stateWith({
        [banner.id]: { ...getRecord(createInitialState(), banner.id), impressions: 1 },
      });

      expect(selectNextPromotion([banner, other], state, NOW, 0)?.id).toBe(other.id);
    });

    it("빈도 제한이 닫혀 있으면 아무것도 고르지 않는다", () => {
      expect(
        selectNextPromotion([banner, highPriorityBanner], createInitialState(), NOW, 1),
      ).toBeNull();
    });

    it("노출 조건을 만족하지 못한 후보는 건너뛴다", () => {
      const state = markOptedOut(createInitialState(), highPriorityBanner.id);

      expect(selectNextPromotion([banner, highPriorityBanner], state, NOW, 0)?.id).toBe(
        banner.id,
      );
    });
  });

  describe("markShown", () => {
    it("방해형은 전역 빈도 예산을 소모한다", () => {
      const state = markShown(createInitialState(), banner, NOW);

      expect(state.global).toEqual({
        lastShownAt: NOW,
        dayKey: "2026-08-11",
        shownToday: 1,
      });
      expect(state.records[banner.id].impressions).toBe(1);
    });

    it("ambient는 자기 기록만 남기고 전역 예산은 건드리지 않는다", () => {
      const state = markShown(createInitialState(), emptyStateCta, NOW);

      expect(state.global).toEqual(createInitialState().global);
      expect(state.records[emptyStateCta.id].impressions).toBe(1);
    });

    it("ambient는 방해형 노출 뒤에도 계속 노출된다", () => {
      const state = markShown(createInitialState(), banner, NOW);

      expect(isEligible(emptyStateCta, getRecord(state, emptyStateCta.id), NOW)).toBe(
        true,
      );
    });
  });
});
