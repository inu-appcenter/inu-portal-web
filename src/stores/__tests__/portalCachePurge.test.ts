import { describe, it, expect, beforeEach } from "vitest";
import { clearPortalCaches, PORTAL_CACHE_KEYS } from "../useUserStore";

const storage = new Map<string, string>();
const localStorageMock = {
  getItem: (key: string) => storage.get(key) ?? null,
  setItem: (key: string, value: string) => storage.set(key, value),
  removeItem: (key: string) => storage.delete(key),
  clear: () => storage.clear(),
};
Object.defineProperty(globalThis, "localStorage", {
  value: localStorageMock,
  writable: true,
});
Object.defineProperty(globalThis, "window", {
  value: { localStorage: localStorageMock },
  writable: true,
});

describe("clearPortalCaches (로그아웃 캐시 소거)", () => {
  beforeEach(() => {
    storage.clear();
  });

  it("포털 학적, 생활원, 성적 캐시 키가 한 번에 모두 안전하게 소거된다", () => {
    // 가상 데이터 세팅
    PORTAL_CACHE_KEYS.forEach((key) => {
      localStorage.setItem(key, `cached_data_for_${key}`);
    });
    // 포털과 무관한 일반 키
    localStorage.setItem("unrelated_key", "keep_this");

    expect(localStorage.getItem("portal_student_info")).toBe("cached_data_for_portal_student_info");
    expect(localStorage.getItem("portal_dormitory_student_info")).toBe("cached_data_for_portal_dormitory_student_info");

    clearPortalCaches();

    // 모든 포털 키 소거 확인
    PORTAL_CACHE_KEYS.forEach((key) => {
      expect(localStorage.getItem(key)).toBeNull();
    });

    // 무관한 키는 보존 확인
    expect(localStorage.getItem("unrelated_key")).toBe("keep_this");
  });
});
