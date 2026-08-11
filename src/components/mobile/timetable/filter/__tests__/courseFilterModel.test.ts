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

import { describe, expect, test, beforeAll } from "vitest";

let DEFAULT_FILTERS: typeof import("../courseFilterModel").DEFAULT_FILTERS;
let ONLINE_TYPE_OPTIONS: typeof import("../courseFilterModel").ONLINE_TYPE_OPTIONS;
let GRADE_OPTIONS: typeof import("../courseFilterModel").GRADE_OPTIONS;
let ISU_FIELD_OPTIONS: typeof import("../courseFilterModel").ISU_FIELD_OPTIONS;
let ONLINE_TYPE_TO_SSUP_NAMES: typeof import("../courseFilterModel").ONLINE_TYPE_TO_SSUP_NAMES;
let expandOnlineTypeLabel: typeof import("../courseFilterModel").expandOnlineTypeLabel;
let getOnlineTypeLabel: typeof import("../courseFilterModel").getOnlineTypeLabel;
let countActiveFilters: typeof import("../courseFilterModel").countActiveFilters;
let buildCategoryChips: typeof import("../courseFilterModel").buildCategoryChips;
let removeChipFromFilters: typeof import("../courseFilterModel").removeChipFromFilters;
let mapFilterToOfferingFilters: typeof import("../../../../../utils/courseSearchResult").mapFilterToOfferingFilters;
let matchesCourseOfferingFilters: typeof import("../../../../../apis/courseOfferings").matchesCourseOfferingFilters;

beforeAll(async () => {
  const model = await import("../courseFilterModel");
  DEFAULT_FILTERS = model.DEFAULT_FILTERS;
  ONLINE_TYPE_OPTIONS = model.ONLINE_TYPE_OPTIONS;
  GRADE_OPTIONS = model.GRADE_OPTIONS;
  ISU_FIELD_OPTIONS = model.ISU_FIELD_OPTIONS;
  ONLINE_TYPE_TO_SSUP_NAMES = model.ONLINE_TYPE_TO_SSUP_NAMES;
  expandOnlineTypeLabel = model.expandOnlineTypeLabel;
  getOnlineTypeLabel = model.getOnlineTypeLabel;
  countActiveFilters = model.countActiveFilters;
  buildCategoryChips = model.buildCategoryChips;
  removeChipFromFilters = model.removeChipFromFilters;

  const resultUtil = await import("../../../../../utils/courseSearchResult");
  mapFilterToOfferingFilters = resultUtil.mapFilterToOfferingFilters;

  const api = await import("../../../../../apis/courseOfferings");
  matchesCourseOfferingFilters = api.matchesCourseOfferingFilters;
});

describe("courseFilterModel & online filter tests", () => {
  test("DEFAULT_FILTERS initialized with empty onlineTypes", () => {
    expect(DEFAULT_FILTERS.onlineTypes).toEqual([]);
    expect(ONLINE_TYPE_OPTIONS.length).toBeGreaterThan(0);
    expect(Object.keys(ONLINE_TYPE_TO_SSUP_NAMES).length).toBeGreaterThan(0);
  });

  test("서버가 제공하는 전학년과 이수영역 옵션을 노출한다", () => {
    expect(GRADE_OPTIONS).toContain("전학년");
    expect(ISU_FIELD_OPTIONS).toContain("(핵심)INU세미나");
    expect(ISU_FIELD_OPTIONS).toContain("학문의기초");
  });

  test("서버가 제공하는 모든 수업 유형 옵션을 노출한다", () => {
    expect(ONLINE_TYPE_OPTIONS).toEqual(
      expect.arrayContaining([
        "RISE(시간표 있음)",
        "강의(이론)",
        "담장너머~,사회봉사(1)",
        "미술실기",
        "사회봉사(2)",
        "사회봉사(3)",
        "실험실습",
        "예술체육실기",
        "이론(어학)",
        "이론실험실습",
        "자기설계세미나",
        "체육실기",
        "현장형(HUSS)",
      ]),
    );
  });

  test("ONLINE_TYPE_TO_SSUP_NAMES maps UI labels to backend ssupTypeName strings", () => {
    expect(expandOnlineTypeLabel("이러닝")).toEqual(["e-Learning"]);
    expect(expandOnlineTypeLabel("이러닝(HUSS)")).toEqual(["e-Learning(HUSS)"]);
    expect(expandOnlineTypeLabel("OCU")).toEqual(["열린사이버대학(OCU)"]);
    expect(expandOnlineTypeLabel("온라인 혼합")).toEqual(["온라인혼합형강좌"]);
    expect(expandOnlineTypeLabel("온라인 혼합(HUSS)")).toEqual([
      "온라인혼합형강좌(HUSS)",
    ]);
    expect(expandOnlineTypeLabel("K-MOOC")).toEqual(["K-MOOC"]);
    expect(expandOnlineTypeLabel("RISE(시간표 없음)")).toEqual([
      "RISE(시간표 없음)",
    ]);
  });

  test("getOnlineTypeLabel correctly extracts UI display label for online course types", () => {
    expect(getOnlineTypeLabel("e-Learning", "E_LEARNING")).toBe("이러닝");
    expect(getOnlineTypeLabel(null, "E_LEARNING")).toBe("이러닝");
    expect(getOnlineTypeLabel("열린사이버대학(OCU)", "OCU")).toBe("OCU");
    expect(getOnlineTypeLabel("온라인혼합형강좌")).toBe("온라인 혼합");
    expect(getOnlineTypeLabel("K-MOOC")).toBe("K-MOOC");
    expect(getOnlineTypeLabel("강의(이론)", "OFFLINE")).toBe(null);
    expect(getOnlineTypeLabel(null, null)).toBe(null);
  });

  test("countActiveFilters includes onlineTypes", () => {
    const filters = {
      ...DEFAULT_FILTERS,
      onlineTypes: ["이러닝", "OCU"],
    };
    expect(countActiveFilters(filters)).toBe(2);
  });

  test("buildCategoryChips creates chips for online category", () => {
    const filters = {
      ...DEFAULT_FILTERS,
      onlineTypes: ["이러닝", "K-MOOC"],
    };
    const chips = buildCategoryChips(filters);
    expect(chips.online).toEqual(["이러닝", "K-MOOC"]);
  });

  test("removeChipFromFilters removes specified chip from onlineTypes", () => {
    const filters = {
      ...DEFAULT_FILTERS,
      onlineTypes: ["이러닝", "OCU"],
    };
    const updated = removeChipFromFilters(filters, "online", "이러닝");
    expect(updated.onlineTypes).toEqual(["OCU"]);
  });

  test("mapFilterToOfferingFilters maps onlineTypes to ssupTypeNames array", () => {
    const filters = {
      ...DEFAULT_FILTERS,
      onlineTypes: ["이러닝", "OCU"],
    };
    const mapped = mapFilterToOfferingFilters(filters);
    expect(mapped.ssupTypeNames).toEqual(["e-Learning", "열린사이버대학(OCU)"]);
  });

  test("전학년과 이수영역을 서버 Name 필터로 매핑한다", () => {
    const mapped = mapFilterToOfferingFilters({
      ...DEFAULT_FILTERS,
      grades: ["전학년"],
      isuFields: ["(핵심)인문", "학문의기초"],
    });

    expect(mapped.hyNames).toEqual(["전학년"]);
    expect(mapped.isuFldNames).toEqual(["(핵심)인문", "학문의기초"]);
  });

  test("matchesCourseOfferingFilters correctly filters offerings by ssupTypeNames", () => {
    const offering1: import("../../../../../types/courseOfferings").CourseOffering = {
      id: 1,
      syllabus: null,
      subjectNumber: "10001001",
      professor: null,
      courseId: 100,
      courseTitle: "이러닝 과목",
      semesterId: 1,
      year: 2026,
      term: "FIRST",
      capacity: 50,
      enrolledCount: 30,
      note: null,
      meetings: [],
      ssupTypeCode: "E_LEARNING",
      ssupTypeName: "e-Learning",
    };

    const offering2: import("../../../../../types/courseOfferings").CourseOffering = {
      id: 2,
      syllabus: null,
      subjectNumber: "10002001",
      professor: null,
      courseId: 101,
      courseTitle: "일반 오프라인 과목",
      semesterId: 1,
      year: 2026,
      term: "FIRST",
      capacity: 50,
      enrolledCount: 30,
      note: null,
      meetings: [],
      ssupTypeCode: "OFFLINE",
      ssupTypeName: "강의(이론)",
    };

    const filters = {
      ssupTypeNames: ["e-Learning", "열린사이버대학(OCU)"],
    };

    expect(matchesCourseOfferingFilters(offering1, undefined, filters)).toBe(true);
    expect(matchesCourseOfferingFilters(offering2, undefined, filters)).toBe(false);
  });
});
