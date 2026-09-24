import { describe, it, expect, beforeEach } from "vitest";
import {
  convertPortalGradesToSemestersData,
  savePortalGradesToCalculatorStorage,
  LOCAL_STORAGE_GRADE_CALCULATOR_KEY,
} from "../portalGradeSync";
import type { CourseGradeItem } from "../ssvParser";

const storage = new Map<string, string>();
const localStorageMock = {
  getItem: (key: string) => storage.get(key) ?? null,
  setItem: (key: string, value: string) => storage.set(key, String(value)),
  removeItem: (key: string) => storage.delete(key),
  clear: () => storage.clear(),
};
Object.defineProperty(globalThis, "localStorage", {
  value: localStorageMock,
  writable: true,
});

describe("portalGradeSync", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  const mockGrades: CourseGradeItem[] = [
    {
      year: "2025",
      semester: "20",
      semesterName: "2025년 2학기",
      courseCode: "0011842",
      courseName: "디지털시대의모바일앱만들기",
      credits: "3",
      grade: "A+",
      courseType: "23",
      courseTypeName: "일선",
      score: "4.50",
      isPassed: true,
      isRetake: false,
    },
    {
      year: "2025",
      semester: "20",
      semesterName: "2025년 2학기",
      courseCode: "0010925",
      courseName: "자연어처리",
      credits: "3",
      grade: "A0",
      courseType: "41",
      courseTypeName: "전선",
      score: "4.00",
      isPassed: true,
      isRetake: false,
    },
    {
      year: "2024",
      semester: "10",
      semesterName: "2024년 1학기",
      courseCode: "0001770",
      courseName: "데이터베이스",
      credits: "3",
      grade: "A+",
      courseType: "31",
      courseTypeName: "전필",
      score: "4.50",
      isPassed: true,
      isRetake: true,
    },
  ];

  it("포털 과목 성적을 SemestersData 포맷으로 변환해야 한다", () => {
    const data = convertPortalGradesToSemestersData(mockGrades);

    expect(data["2025-SECOND"]).toBeDefined();
    expect(data["2025-SECOND"].length).toBe(2);
    expect(data["2025-SECOND"][0].name).toBe("디지털시대의모바일앱만들기");
    expect(data["2025-SECOND"][0].grade).toBe("A+");
    expect(data["2025-SECOND"][1].isMajor).toBe(true); // 41: 전선

    expect(data["2024-FIRST"]).toBeDefined();
    expect(data["2024-FIRST"].length).toBe(1);
    expect(data["2024-FIRST"][0].excluded).toBe(true); // 재수강
    expect(data["2024-FIRST"][0].isMajor).toBe(true); // 31: 전필
  });

  it("포털 성적을 로컬스토리지에 정상 병합 저장해야 한다", () => {
    const result = savePortalGradesToCalculatorStorage(mockGrades);

    expect(result.semestersCount).toBe(2);
    expect(result.subjectsCount).toBe(3);

    const cachedRaw = localStorage.getItem(LOCAL_STORAGE_GRADE_CALCULATOR_KEY);
    expect(cachedRaw).not.toBeNull();
    const parsed = JSON.parse(cachedRaw!);
    expect(parsed.semestersData["2025-SECOND"].length).toBe(2);
  });
});
