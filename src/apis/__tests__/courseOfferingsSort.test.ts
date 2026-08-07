if (typeof localStorage === "undefined") {
  const store: Record<string, string> = {};
  (globalThis as unknown as { localStorage: Storage }).localStorage = {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = String(value);
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      for (const k in store) delete store[k];
    },
    length: 0,
    key: () => null,
  };
}

import { describe, expect, test, beforeAll, vi } from "vitest";
import type { CourseOffering } from "@/types/courseOfferings";

vi.mock("@/mocks/mockFlag", () => ({
  isMockApiEnabled: () => true,
  mockDelay: () => Promise.resolve(),
}));

let getCategoryOrder: typeof import("@/utils/courseSearchResult").getCategoryOrder;
let getHyNameOrder: typeof import("@/utils/courseSearchResult").getHyNameOrder;
let sortCourseOfferingsByGradeAndCategory: typeof import("@/utils/courseSearchResult").sortCourseOfferingsByGradeAndCategory;
let getCourseOfferingsPage: typeof import("@/apis/courseOfferings").getCourseOfferingsPage;

beforeAll(async () => {
  const resultUtils = await import("@/utils/courseSearchResult");
  getCategoryOrder = resultUtils.getCategoryOrder;
  getHyNameOrder = resultUtils.getHyNameOrder;
  sortCourseOfferingsByGradeAndCategory = resultUtils.sortCourseOfferingsByGradeAndCategory;

  const api = await import("@/apis/courseOfferings");
  getCourseOfferingsPage = api.getCourseOfferingsPage;
});

describe("Course Offerings Grade & Category Sorting (Issue #258)", () => {
  describe("getCategoryOrder", () => {
    test("categorizes Major (전공) as priority 1", () => {
      expect(getCategoryOrder("전공기초")).toBe(1);
      expect(getCategoryOrder("전공핵심")).toBe(1);
      expect(getCategoryOrder("전공심화")).toBe(1);
    });

    test("categorizes General Education (교양) as priority 2", () => {
      expect(getCategoryOrder("기초교양")).toBe(2);
      expect(getCategoryOrder("핵심교양")).toBe(2);
      expect(getCategoryOrder("심화교양")).toBe(2);
      expect(getCategoryOrder("교양")).toBe(2);
    });

    test("categorizes Other (일반선택, 군사학, null) as priority 3", () => {
      expect(getCategoryOrder("일반선택")).toBe(3);
      expect(getCategoryOrder("군사학")).toBe(3);
      expect(getCategoryOrder(null)).toBe(3);
      expect(getCategoryOrder(undefined)).toBe(3);
    });
  });

  describe("getHyNameOrder", () => {
    test("maps '전체', '공통', '전학년', empty/null to 1", () => {
      expect(getHyNameOrder("전체")).toBe(1);
      expect(getHyNameOrder("공통")).toBe(1);
      expect(getHyNameOrder("전학년")).toBe(1);
      expect(getHyNameOrder(null)).toBe(1);
      expect(getHyNameOrder("")).toBe(1);
    });

    test("maps 1~4학년 to 2~5 sequentially", () => {
      expect(getHyNameOrder("1학년")).toBe(2);
      expect(getHyNameOrder("1")).toBe(2);
      expect(getHyNameOrder("2학년")).toBe(3);
      expect(getHyNameOrder("2")).toBe(3);
      expect(getHyNameOrder("3학년")).toBe(4);
      expect(getHyNameOrder("3")).toBe(4);
      expect(getHyNameOrder("4학년")).toBe(5);
      expect(getHyNameOrder("4")).toBe(5);
    });

    test("maps unspecified grade names to 99", () => {
      expect(getHyNameOrder("5학년")).toBe(99);
      expect(getHyNameOrder("대학원")).toBe(99);
    });
  });

  describe("sortCourseOfferingsByGradeAndCategory", () => {
    test("sorts offerings by category (Major first), then grade (1-4학년), then title asc", () => {
      const createDummyOffering = (
        id: number,
        isuName: string,
        hyName: string,
        courseTitle: string,
      ): Partial<CourseOffering> => ({
        id,
        isuName,
        hyName,
        courseTitle,
      });

      const list = [
        createDummyOffering(1, "교양", "1학년", "교양 1학년 A"),
        createDummyOffering(2, "전공핵심", "3학년", "전공 3학년 A"),
        createDummyOffering(3, "전공기초", "1학년", "전공 1학년 A"),
        createDummyOffering(4, "전공기초", "2학년", "전공 2학년 A"),
        createDummyOffering(5, "전공기초", "1학년", "전공 1학년 B"),
        createDummyOffering(6, "일반선택", "1학년", "일반선택 1학년 A"),
      ] as CourseOffering[];

      const sorted = sortCourseOfferingsByGradeAndCategory(list);

      expect(sorted.map((item) => item.id)).toEqual([3, 5, 4, 2, 1, 6]);
    });
  });

  describe("Mock API Page Response Sorting", () => {
    test("getCourseOfferingsPage returns mock offerings sorted by grade and category", async () => {
      const pageData = await getCourseOfferingsPage(2026, "SECOND", 0, 50);

      expect(pageData.content.length).toBeGreaterThan(0);

      // Verify that for all adjacent pairs in mock result, category & grade order is non-decreasing
      for (let i = 0; i < pageData.content.length - 1; i++) {
        const current = pageData.content[i];
        const next = pageData.content[i + 1];

        const catCurr = getCategoryOrder(current.isuName);
        const catNext = getCategoryOrder(next.isuName);
        expect(catCurr).toBeLessThanOrEqual(catNext);

        if (catCurr === catNext) {
          const hyCurr = getHyNameOrder(current.hyName);
          const hyNext = getHyNameOrder(next.hyName);
          expect(hyCurr).toBeLessThanOrEqual(hyNext);

          if (hyCurr === hyNext) {
            const titleCompare = current.courseTitle.localeCompare(next.courseTitle, "ko");
            expect(titleCompare).toBeLessThanOrEqual(0);
          }
        }
      }
    });
  });
});
