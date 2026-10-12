import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  PROMOTION_SEEN_STORAGE_KEY,
  SEEN_PROMOTIONS,
  promotionSeenStorage,
} from "../seenStorage";

function createMemoryStorage(): Storage {
  const data = new Map<string, string>();
  return {
    get length() {
      return data.size;
    },
    clear: () => data.clear(),
    getItem: (key) => data.get(key) ?? null,
    key: (index) => [...data.keys()][index] ?? null,
    removeItem: (key) => {
      data.delete(key);
    },
    setItem: (key, value) => {
      data.set(key, String(value));
    },
  };
}

const localStorage = createMemoryStorage();
vi.stubGlobal("window", { localStorage });

describe("promotionSeenStorage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("확인 전에는 false, mark 후에는 true", () => {
    const id = SEEN_PROMOTIONS.PORTAL_AUTO_SYNC_INTRO;
    expect(promotionSeenStorage.has(id)).toBe(false);

    promotionSeenStorage.mark(id);

    expect(promotionSeenStorage.has(id)).toBe(true);
    expect(promotionSeenStorage.getSeenAt(id)).toEqual(expect.any(Number));
  });

  it("모든 안내를 키 하나에 모아 저장한다", () => {
    promotionSeenStorage.mark(SEEN_PROMOTIONS.PORTAL_AUTO_SYNC_INTRO);
    promotionSeenStorage.mark(SEEN_PROMOTIONS.DAILY_BRIEF_INTRO);

    expect(localStorage.length).toBe(1);
    expect(
      Object.keys(JSON.parse(localStorage.getItem(PROMOTION_SEEN_STORAGE_KEY)!)),
    ).toEqual([
      SEEN_PROMOTIONS.PORTAL_AUTO_SYNC_INTRO,
      SEEN_PROMOTIONS.DAILY_BRIEF_INTRO,
    ]);
  });

  it("markIfFirst는 처음 한 번만 true", () => {
    const id = SEEN_PROMOTIONS.LECTURE_REVIEW_NOTICE;
    expect(promotionSeenStorage.markIfFirst(id)).toBe(true);
    expect(promotionSeenStorage.markIfFirst(id)).toBe(false);
  });

  it("레거시 키로 이미 본 안내는 본 것으로 옮기고 레거시 키를 지운다", () => {
    localStorage.setItem("daily_brief_intro_shown", "true");

    expect(promotionSeenStorage.has(SEEN_PROMOTIONS.DAILY_BRIEF_INTRO)).toBe(true);
    expect(localStorage.getItem("daily_brief_intro_shown")).toBeNull();
    expect(promotionSeenStorage.has(SEEN_PROMOTIONS.DAILY_BRIEF_INTRO)).toBe(true);
  });

  it("reset으로 다시 보여줄 수 있다", () => {
    const id = SEEN_PROMOTIONS.GRADE_CALCULATOR_INTRO;
    promotionSeenStorage.mark(id);
    promotionSeenStorage.mark(SEEN_PROMOTIONS.DAILY_BRIEF_INTRO);

    promotionSeenStorage.reset(id);
    expect(promotionSeenStorage.has(id)).toBe(false);
    expect(promotionSeenStorage.has(SEEN_PROMOTIONS.DAILY_BRIEF_INTRO)).toBe(true);

    promotionSeenStorage.reset();
    expect(promotionSeenStorage.has(SEEN_PROMOTIONS.DAILY_BRIEF_INTRO)).toBe(false);
  });

  it("저장된 값이 깨져 있으면 비어 있는 것으로 보고 다음 mark에서 복구한다", () => {
    const id = SEEN_PROMOTIONS.PORTAL_AUTO_SYNC_INTRO;
    localStorage.setItem(PROMOTION_SEEN_STORAGE_KEY, "{broken");

    expect(promotionSeenStorage.has(id)).toBe(false);
    promotionSeenStorage.mark(id);
    expect(promotionSeenStorage.has(id)).toBe(true);
  });

  it("저장소를 쓸 수 없으면 본 것으로 처리한다", () => {
    vi.stubGlobal("window", undefined);
    try {
      expect(promotionSeenStorage.has(SEEN_PROMOTIONS.PORTAL_AUTO_SYNC_INTRO)).toBe(
        true,
      );
    } finally {
      vi.stubGlobal("window", { localStorage });
    }
  });
});
