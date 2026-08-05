import type { Course } from "@/types/courses";
import type { ParsedGradeRow } from "@/types/gradeImport";

/**
 * 성적표 행 ↔ Course 매칭의 순수 규칙.
 *
 * API를 부르지 않는 부분만 모아둔다(호출 흐름은 `resolveGradeCourses.ts`).
 * Course에는 학수번호 필드가 없어 과목명으로 맞출 수밖에 없고, 같은 이름이 학과별로
 * 여러 개 존재하기 때문에(예: "운영체제" 3건) 좁히는 규칙이 매칭 품질을 좌우한다.
 */

export const normalizeCourseTitle = (title: string) =>
  title.replace(/\s/g, "").toLowerCase();

/** 후보를 좁히되, 조건에 맞는 게 하나도 없으면 원래 후보를 유지한다. */
const narrow = <T,>(candidates: T[], predicate: (item: T) => boolean): T[] => {
  const next = candidates.filter(predicate);
  return next.length > 0 ? next : candidates;
};

export const buildCourseTitleIndex = (courses: Course[]) => {
  const index = new Map<string, Course[]>();
  for (const course of courses) {
    const key = normalizeCourseTitle(course.title);
    const bucket = index.get(key);
    if (bucket) bucket.push(course);
    else index.set(key, [course]);
  }
  return index;
};

/**
 * 같은 과목명 후보들 중 하나를 고른다.
 *
 * 성적표가 들고 있는 정보(이수구분·학점)를 먼저 쓰고, 그래도 남으면 소속으로 가른다.
 * 교양 과목은 Course의 학과가 "교양"으로 들어가 있어 사용자 학과와는 매칭되지 않으므로,
 * 이수구분이 교양류인지에 따라 기대하는 학과가 달라진다.
 */
export const narrowCourseCandidates = (
  candidates: Course[],
  row: ParsedGradeRow,
  myDepartment?: string | null,
): Course[] => {
  let result = candidates;
  if (result.length <= 1) return result;

  if (row.isuName) {
    result = narrow(result, (c) => c.completionDivisionName === row.isuName);
  }
  if (result.length > 1 && row.credit !== null) {
    result = narrow(result, (c) => Number(c.credit) === row.credit);
  }
  if (result.length > 1) {
    const isGeneralEducation = row.isuName?.includes("교양") ?? false;
    if (isGeneralEducation) {
      result = narrow(result, (c) => c.departmentName === "교양");
    } else if (myDepartment) {
      result = narrow(result, (c) => c.departmentName === myDepartment);
    }
  }
  return result;
};
