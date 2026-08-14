import { create } from "zustand";

import { mixpanelTrack } from "@/utils/mixpanel";
import {
  DEFAULT_PROMOTION_LIMITS,
  getRecord,
  isEligible,
  markOptedOut,
  markShown,
  markSnoozed,
  selectNextPromotion,
} from "@/utils/promotion/policy";
import {
  loadPromotionState,
  savePromotionState,
} from "@/utils/promotion/storage";
import type {
  PromotionDefinition,
  PromotionId,
  PromotionState,
} from "@/utils/promotion/types";

/**
 * 현재 화면에 마운트되어 "띄워도 된다면 띄우겠다"고 등록한 프로모션들.
 * 렌더링에 직접 쓰이지 않으므로 스토어 상태 밖에 둔다.
 */
const candidates = new Map<PromotionId, PromotionDefinition>();

/** 한 세션에 같은 프로모션의 노출이 두 번 집계되지 않게 막는 가드 */
const impressionTrackedIds = new Set<PromotionId>();

let settleHandle: number | null = null;

function getAnalyticsName(definition: PromotionDefinition) {
  return definition.analyticsName ?? definition.id;
}

interface PromotionStore {
  state: PromotionState;
  /** 지금 노출 중인 방해형 프로모션 */
  activeId: PromotionId | null;
  /** 지금 노출 중인 ambient 프로모션들 */
  ambientIds: PromotionId[];
  /** 이번 세션에 노출한 방해형 프로모션 수 */
  sessionShownCount: number;

  register: (definition: PromotionDefinition) => void;
  unregister: (id: PromotionId) => void;
  /** 닫기(X) — 이번엔 넘기고 나중에 다시 기회를 준다. */
  dismiss: (id: PromotionId) => void;
  /** 프로모션을 통해 기능으로 이동 — 목적을 달성했으므로 영구 종료. */
  accept: (id: PromotionId, actionType: string) => void;
  /** "다시 보지 않기" — 영구 종료. */
  optOut: (id: PromotionId) => void;
}

const usePromotionStore = create<PromotionStore>((set, get) => {
  function persist(state: PromotionState) {
    savePromotionState(state);
    return state;
  }

  function show(definition: PromotionDefinition, now: number) {
    const alreadyTracked = impressionTrackedIds.has(definition.id);
    const nextState = alreadyTracked
      ? get().state
      : persist(markShown(get().state, definition, now));

    impressionTrackedIds.add(definition.id);

    if (definition.surface === "ambient") {
      set((prev) => ({
        state: nextState,
        ambientIds: prev.ambientIds.includes(definition.id)
          ? prev.ambientIds
          : [...prev.ambientIds, definition.id],
      }));
    } else {
      set((prev) => ({
        state: nextState,
        activeId: definition.id,
        // 같은 세션에서 다시 마운트된 것뿐이라면 예산을 또 쓰지 않는다.
        sessionShownCount: alreadyTracked
          ? prev.sessionShownCount
          : prev.sessionShownCount + 1,
      }));
    }

    if (!alreadyTracked) {
      mixpanelTrack.promotionImpression(
        getAnalyticsName(definition),
        definition.location,
      );
    }
  }

  /** 등록된 후보 중 방해형 하나를 골라 활성화한다. */
  function settle() {
    settleHandle = null;

    const { activeId, state, sessionShownCount } = get();

    // 이미 뜬 것은 닫히거나 화면에서 사라질 때까지 유지한다.
    if (activeId !== null) {
      if (candidates.has(activeId)) {
        return;
      }

      set({ activeId: null });
    }

    const interruptiveCandidates = [...candidates.values()].filter(
      (definition) => definition.surface !== "ambient",
    );

    const winner = selectNextPromotion(
      interruptiveCandidates,
      state,
      Date.now(),
      sessionShownCount,
      DEFAULT_PROMOTION_LIMITS,
    );

    if (winner) {
      show(winner, Date.now());
    }
  }

  /**
   * 후보 등록은 컴포넌트마다 흩어진 시점에 일어난다.
   * 한 프레임 모았다가 중재해야 우선순위가 의미를 갖는다.
   */
  function scheduleSettle() {
    if (settleHandle !== null) {
      return;
    }

    if (typeof window === "undefined") {
      settle();
      return;
    }

    settleHandle = window.requestAnimationFrame(settle);
  }

  function retire(id: PromotionId, nextState: PromotionState) {
    persist(nextState);

    set((prev) => ({
      state: nextState,
      activeId: prev.activeId === id ? null : prev.activeId,
      ambientIds: prev.ambientIds.filter((ambientId) => ambientId !== id),
    }));
  }

  return {
    state: loadPromotionState(),
    activeId: null,
    ambientIds: [],
    sessionShownCount: 0,

    register: (definition) => {
      candidates.set(definition.id, definition);

      if (definition.surface !== "ambient") {
        scheduleSettle();
        return;
      }

      const { state, ambientIds } = get();

      if (ambientIds.includes(definition.id)) {
        return;
      }

      if (isEligible(definition, getRecord(state, definition.id), Date.now())) {
        show(definition, Date.now());
      }
    },

    unregister: (id) => {
      candidates.delete(id);

      const { activeId, ambientIds } = get();

      if (activeId === id) {
        set({ activeId: null });
        scheduleSettle();
      }

      if (ambientIds.includes(id)) {
        set({ ambientIds: ambientIds.filter((ambientId) => ambientId !== id) });
      }
    },

    dismiss: (id) => {
      const definition = candidates.get(id);

      if (!definition) {
        return;
      }

      mixpanelTrack.promotionClicked(
        getAnalyticsName(definition),
        "Close Button",
        definition.location,
      );

      retire(id, markSnoozed(get().state, definition, Date.now()));
    },

    accept: (id, actionType) => {
      const definition = candidates.get(id);

      if (definition) {
        mixpanelTrack.promotionClicked(
          getAnalyticsName(definition),
          actionType,
          definition.location,
        );
      }

      retire(id, markOptedOut(get().state, id));
    },

    optOut: (id) => {
      const definition = candidates.get(id);

      if (definition) {
        mixpanelTrack.promotionClicked(
          getAnalyticsName(definition),
          "Opt Out",
          definition.location,
        );
      }

      retire(id, markOptedOut(get().state, id));
    },
  };
});

export default usePromotionStore;
