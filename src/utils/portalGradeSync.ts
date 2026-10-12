import type { Term } from "@/types/timetables";
import type { CourseGradeItem } from "./ssvParser";
import { formatCourseType } from "./ssvParser";

export const LOCAL_STORAGE_GRADE_CALCULATOR_KEY = "intip_grade_calculator_data_v2";

export interface CalculatorSubject {
  id: string;
  name: string;
  credits: number;
  grade: string;
  isMajor: boolean;
  courseCode?: string;
  courseId?: number | null;
  isuName?: string | null;
  isuFldName?: string | null;
  note?: string | null;
  excluded?: boolean;
  sourceYear?: number;
  sourceTerm?: Term;
}

export type CalculatorSemestersData = Record<string, CalculatorSubject[]>;

/**
 * 포털 학기 구분 코드(10, 20, 30, 40)를 intip Term으로 변환
 */
export function mapTmGbnToTerm(tmGbn: string): Term {
  switch (tmGbn) {
    case "10":
      return "FIRST";
    case "20":
      return "SECOND";
    case "30":
      return "SUMMER";
    case "40":
      return "WINTER";
    default:
      return "FIRST";
  }
}

/**
 * 포털 과목 성적 목록(CourseGradeItem[])을 학점 계산기 SemestersData로 변환
 */
export function convertPortalGradesToSemestersData(
  courseGrades: CourseGradeItem[],
): CalculatorSemestersData {
  const result: CalculatorSemestersData = {};

  courseGrades.forEach((item) => {
    const year = Number(item.year);
    if (!year || isNaN(year)) return;

    const term = mapTmGbnToTerm(item.semester);
    const semKey = `${year}-${term}`;

    if (!result[semKey]) {
      result[semKey] = [];
    }

    // 이수구분 전공 여부 판별 (30: 전필, 31: 전필, 40: 전선, 41: 전선 등)
    const isMajor =
      ["30", "31", "40", "41"].includes(item.courseType) ||
      item.courseType.includes("전공");

    const subject: CalculatorSubject = {
      id: `portal-${item.courseCode}-${item.year}-${item.semester}-${Math.random().toString(36).substring(2, 7)}`,
      name: item.courseName,
      credits: Number(item.credits) || 0,
      grade: item.grade || "",
      isMajor,
      courseCode: item.courseCode,
      isuName: item.courseTypeName || formatCourseType(item.courseType),
      note: item.isRetake ? "재수강" : null,
      excluded: item.isRetake,
      sourceYear: year,
      sourceTerm: term,
    };

    // 동일 과목 중복 방지 (동일 학기에 같은 과목코드 또는 이름이 있으면 덮어씀)
    const existingIndex = result[semKey].findIndex(
      (s) =>
        (s.courseCode && s.courseCode === item.courseCode) ||
        s.name.trim() === item.courseName.trim(),
    );

    if (existingIndex >= 0) {
      result[semKey][existingIndex] = subject;
    } else {
      result[semKey].push(subject);
    }
  });

  return result;
}

/**
 * 포털 성적 목록을 학점 계산기 로컬스토리지에 저장 (기본: 포털 공식 성적으로 전체 덮어쓰기)
 */
export function savePortalGradesToCalculatorStorage(
  courseGrades: CourseGradeItem[],
  options?: { merge?: boolean },
): {
  semestersCount: number;
  subjectsCount: number;
  mergedData: CalculatorSemestersData;
} {
  let existingSemestersData: CalculatorSemestersData = {};
  let targetCredits = 130;
  let graduationProfile = { departmentCode: "", entryYear: null, targetGpa: null };
  let targetCreditsOverridden = false;

  try {
    const rawCached = localStorage.getItem(LOCAL_STORAGE_GRADE_CALCULATOR_KEY);
    if (rawCached) {
      const parsed = JSON.parse(rawCached);
      if (parsed.semestersData) existingSemestersData = parsed.semestersData;
      if (typeof parsed.targetCredits === "number") targetCredits = parsed.targetCredits;
      if (parsed.graduationProfile) graduationProfile = parsed.graduationProfile;
      if (typeof parsed.targetCreditsOverridden === "boolean")
        targetCreditsOverridden = parsed.targetCreditsOverridden;
    }
  } catch (e) {
    console.warn("Failed to load existing grade calculator cache", e);
  }

  const incomingData = convertPortalGradesToSemestersData(courseGrades);
  const finalData: CalculatorSemestersData = options?.merge
    ? { ...existingSemestersData }
    : { ...incomingData };

  let totalSubjects = 0;

  if (options?.merge) {
    Object.entries(incomingData).forEach(([semKey, incomingSubjects]) => {
      if (!finalData[semKey]) {
        finalData[semKey] = incomingSubjects;
      } else {
        const currentList = [...finalData[semKey]];
        incomingSubjects.forEach((inSub) => {
          const idx = currentList.findIndex(
            (c) =>
              (c.courseCode && c.courseCode === inSub.courseCode) ||
              c.name.trim() === inSub.name.trim(),
          );
          if (idx >= 0) {
            currentList[idx] = { ...currentList[idx], ...inSub, id: currentList[idx].id };
          } else {
            currentList.push(inSub);
          }
        });
        finalData[semKey] = currentList;
      }
    });
  }

  Object.values(finalData).forEach((subs) => {
    totalSubjects += subs.length;
  });

  // 로컬스토리지에 직렬화 저장
  localStorage.setItem(
    LOCAL_STORAGE_GRADE_CALCULATOR_KEY,
    JSON.stringify({
      semestersData: finalData,
      targetCredits,
      graduationProfile,
      targetCreditsOverridden,
    }),
  );

  return {
    semestersCount: Object.keys(incomingData).length,
    subjectsCount: courseGrades.length,
    mergedData: finalData,
  };
}
