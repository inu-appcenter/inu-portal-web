import { safeLocalStorage } from "@/utils/safeStorage";
import { DISMISSED_TOOLTIP_STORAGE_KEY } from "@/utils/dismissibleTooltipStorage";

import { createEmptyRecord, createInitialState } from "./policy";
import type { PromotionRecord, PromotionState } from "./types";

const PROMOTION_STATE_STORAGE_KEY = "promotion-state-v1";

function isRecordLike(value: unknown): value is Partial<PromotionRecord> {
  return typeof value === "object" && value !== null;
}

function parseRecord(value: unknown): PromotionRecord {
  const fallback = createEmptyRecord();

  if (!isRecordLike(value)) {
    return fallback;
  }

  return {
    impressions:
      typeof value.impressions === "number" ? value.impressions : fallback.impressions,
    lastShownAt:
      typeof value.lastShownAt === "number" ? value.lastShownAt : fallback.lastShownAt,
    snoozedUntil:
      typeof value.snoozedUntil === "number"
        ? value.snoozedUntil
        : fallback.snoozedUntil,
    optedOut: value.optedOut === true,
  };
}

function parseState(rawValue: string | null): PromotionState {
  const fallback = createInitialState();

  if (!rawValue) {
    return fallback;
  }

  try {
    const parsed: unknown = JSON.parse(rawValue);

    if (typeof parsed !== "object" || parsed === null) {
      return fallback;
    }

    const { records, global } = parsed as {
      records?: unknown;
      global?: unknown;
    };

    const parsedRecords: PromotionState["records"] = {};

    if (typeof records === "object" && records !== null) {
      Object.entries(records).forEach(([id, record]) => {
        parsedRecords[id] = parseRecord(record);
      });
    }

    const parsedGlobal =
      typeof global === "object" && global !== null
        ? (global as Partial<PromotionState["global"]>)
        : {};

    return {
      records: parsedRecords,
      global: {
        lastShownAt:
          typeof parsedGlobal.lastShownAt === "number" ? parsedGlobal.lastShownAt : 0,
        dayKey: typeof parsedGlobal.dayKey === "string" ? parsedGlobal.dayKey : "",
        shownToday:
          typeof parsedGlobal.shownToday === "number" ? parsedGlobal.shownToday : 0,
      },
    };
  } catch (error) {
    console.warn("[promotion] Failed to parse stored state", error);
    return fallback;
  }
}

/**
 * 구버전 `dismissibleTooltipStorage`에서 이미 닫은 툴팁을 영구 종료 상태로 승계한다.
 * 한 번 닫은 사용자에게 같은 안내가 다시 뜨지 않게 하기 위한 것이라 단방향으로만 적용한다.
 */
function mergeLegacyDismissals(state: PromotionState): PromotionState {
  const rawValue = safeLocalStorage.getItem(DISMISSED_TOOLTIP_STORAGE_KEY);

  if (!rawValue) {
    return state;
  }

  try {
    const parsed: unknown = JSON.parse(rawValue);

    if (!Array.isArray(parsed)) {
      return state;
    }

    const records = { ...state.records };

    parsed.forEach((id) => {
      if (typeof id !== "string" || !id) {
        return;
      }

      const record = records[id] ?? createEmptyRecord();

      if (record.optedOut) {
        return;
      }

      records[id] = { ...record, optedOut: true };
    });

    return { ...state, records };
  } catch (error) {
    console.warn("[promotion] Failed to merge legacy dismissals", error);
    return state;
  }
}

export function loadPromotionState(): PromotionState {
  return mergeLegacyDismissals(
    parseState(safeLocalStorage.getItem(PROMOTION_STATE_STORAGE_KEY)),
  );
}

export function savePromotionState(state: PromotionState) {
  safeLocalStorage.setItem(PROMOTION_STATE_STORAGE_KEY, JSON.stringify(state));
}

export function clearPromotionState() {
  safeLocalStorage.removeItem(PROMOTION_STATE_STORAGE_KEY);
}

export { PROMOTION_STATE_STORAGE_KEY };
