/** 학과 교육과정표 전공필수 과목(issue #335) 조회·판정 */
import type {
  EvaluatedSubject,
  RequiredMajorCourse,
  RequiredMajorCourseProgress,
  RequiredMajorCourseSet,
} from "@/types/graduation";
import { normalizeFull } from "./requiredCourseMatch";

/**
 * 입학연도에 맞는 전공필수 과목. 교육과정표가 없는 학번(2016학번 이전 등)은 null.
 * 졸업학점 규정과 달리 가장 가까운 연도로 대체하지 않는다 — 교육과정은 해마다
 * 과목이 바뀌어 다른 학번 것을 보여주면 틀린 "미이수"가 된다.
 */
export const findRequiredMajorCourses = (
  sets: RequiredMajorCourseSet[] | undefined,
  entryYear: number,
): RequiredMajorCourse[] | null =>
  sets?.find((set) => entryYear >= set.startYear && entryYear <= set.endYear)
    ?.courses ?? null;

/**
 * 생성 데이터가 200KB가 넘어 학점계산기에서 학과·학번이 정해졌을 때만 불러온다.
 */
export const loadRequiredMajorCourses = async (
  departmentCode: string,
  entryYear: number,
): Promise<RequiredMajorCourse[] | null> => {
  const { REQUIRED_MAJOR_COURSES } =
    await import("@/resources/data/requiredMajorCourses");
  return findRequiredMajorCourses(
    REQUIRED_MAJOR_COURSES[departmentCode],
    entryYear,
  );
};

const ROMAN_NUMERALS: [RegExp, string][] = [
  [/Ⅰ/g, "1"],
  [/Ⅱ/g, "2"],
  [/Ⅲ/g, "3"],
  [/Ⅳ/g, "4"],
  [/Ⅴ/g, "5"],
  [/Ⅵ/g, "6"],
  // "자기설계세미나 I"·"(II)"처럼 띄어 쓰거나 괄호로 감싼 로마 숫자만 바꾼다("AI"는 그대로).
  [/(?<=[\s(])IV(?=[\s)]|$)/g, "4"],
  [/(?<=[\s(])III(?=[\s)]|$)/g, "3"],
  [/(?<=[\s(])II(?=[\s)]|$)/g, "2"],
  [/(?<=[\s(])I(?=[\s)]|$)/g, "1"],
  // 국어국문 교육과정표는 "자기설계 Seminar1", 성적표는 "자기설계세미나1"로 적는다.
  [/seminar/gi, "세미나"],
];

/** 교육과정표와 성적표의 과목명 표기 차이("C언어프로그래밍(2)"·"자기설계세미나 I")를 없앤다. */
export const normalizeMajorCourseName = (name: string): string =>
  normalizeFull(
    ROMAN_NUMERALS.reduce(
      (value, [pattern, digit]) => value.replace(pattern, digit),
      name,
    ),
  );

/** 취득한 과목 중 이름이 같은 과목이 있으면 이수로 본다. */
export const matchRequiredMajorCourses = (
  courses: RequiredMajorCourse[],
  subjects: EvaluatedSubject[],
): RequiredMajorCourseProgress[] => {
  const passedNames = new Set(
    subjects
      .filter((subject) => subject.passed)
      .map((subject) => normalizeMajorCourseName(subject.name)),
  );

  return courses.map(([courseName, credits, division]) => ({
    courseName,
    credits,
    division,
    done: passedNames.has(normalizeMajorCourseName(courseName)),
  }));
};
