/**
 * 필수 교양 요건 ↔ 취득 과목 매칭 규칙.
 *
 * 졸업요건 데이터의 `courseName`은 학과 안내문을 옮긴 것이라 표기가 제각각이다
 * ("영어(대학영어 또는 Academic English)", "영어 관련 과목", "대학수학1,2" …).
 * 그래서 요건 이름을 **실제 개설 과목**(generalCourseCatalog)으로 먼저 풀고,
 * 카탈로그에 없는 표기만 카테고리 키워드로 폴백한다.
 *
 * 카탈로그로 푸는 이유는 두 가지다.
 * 1. "대학영어회화1"과 "대학영어회화2"처럼 끝자리로만 갈리는 과목을 정확히 가른다.
 * 2. 광의 표기("영어")가 특정 과목 요건(회화1·회화2)이 가져가야 할 과목을
 *    먼저 삼키는 문제를 없앤다 — 배정을 요건 순서가 아니라 **매칭 강도** 순으로 한다.
 */
import {
  GENERAL_COURSE_CATALOG,
  type GeneralCourseCatalogEntry,
} from "@/resources/data/generalCourseCatalog";
import type {
  EvaluatedSubject,
  RequiredGeneralCategory,
  RequiredGeneralCourse,
} from "@/types/graduation";

/** 카탈로그 생성 스크립트(build-general-course-catalog.mjs)와 같은 규칙이어야 한다. */
export const normalizeFull = (value: string): string =>
  value.toLowerCase().replace(/[\s·,()[\]{}/\\&+.'"’-]/g, "");

/** 끝자리 숫자를 뗀 형태. "대학수학" 요건이 대학수학(1)·(2)를 함께 잡을 때 쓴다. */
export const normalizeBase = (value: string): string =>
  normalizeFull(value).replace(/[0-9]+$/, "");

/**
 * 요건의 과목명이 "국어", "영어", "회화"처럼 영역만 가리키는 경우에 쓰는 키워드.
 * 카탈로그로 풀리지 않은 요건에만 적용하는 마지막 수단이다.
 */
const CATEGORY_KEYWORDS: Record<RequiredGeneralCategory, string[]> = {
  국어: ["국어", "글쓰기", "작문", "말하기"],
  영어: ["영어", "english"],
  SW: ["sw", "소프트웨어", "컴퓨팅적사고", "코딩"],
  수학: ["수학", "미적분"],
  기타: [],
};

/**
 * 카테고리 키워드가 다른 영역 과목까지 끌어오는 것을 막는다.
 * "영어독해와작문"은 국어 키워드 "작문"에 걸리지만 국어 요건 과목이 아니다.
 */
const CATEGORY_EXCLUSIONS: Partial<Record<RequiredGeneralCategory, string[]>> = {
  국어: ["영어", "english"],
};

const GENERIC_ALIASES = new Set(["국어", "영어", "sw", "수학", "회화"]);

/** 과목명에서 떼어내도 의미가 없는 조각들 */
const STOP_TOKENS = new Set([
  "관련",
  "과목",
  "1과목",
  "이상",
  "또는",
  "전공필수",
  "및",
  "기타",
  "선택",
  "academic",
]);

/**
 * 요건 과목명을 매칭용 별칭들로 푼다.
 * "영어(대학영어 또는 Academic English)" → ["대학영어", "academicenglish", …]
 * 영역만 가리키는 조각("영어")은 별칭이 아니라 카테고리 폴백으로 넘긴다.
 */
const buildAliases = (course: RequiredGeneralCourse): string[] => {
  const segments = course.courseName
    .replace(/[()]/g, " ")
    .split(/또는|,|\/|=/g)
    .flatMap((segment) => [segment, ...segment.split(/\s+/)]);

  const aliases = new Set<string>();
  segments.forEach((segment) => {
    const normalized = normalizeFull(segment);
    if (!normalized || STOP_TOKENS.has(normalized)) return;
    if (GENERIC_ALIASES.has(normalized)) return;
    // 너무 짧은 조각은 아무 과목명에나 걸린다.
    if (normalized.length < 3) return;
    aliases.add(normalized);
  });

  return [...aliases];
};

/** 필수 교양 요건이 가리킬 수 있는 과목. 기초교양 + 요건이 지목한 대체 과목. */
const REQUIREMENT_POOL = GENERAL_COURSE_CATALOG.filter(
  (entry) => entry.division === "기초교양" || entry.substitute,
);

/**
 * 요건 이름 → 실제 개설 과목들.
 * 완전일치 → 끝자리만 다른 과목 → 부분일치 순으로 넓혀 가되, 더 좁은 단계에서
 * 찾으면 거기서 멈춘다("대학영어회화1"이 "대학영어회화2"까지 끌고 오지 않게).
 */
export const resolveRequirementCourses = (
  course: RequiredGeneralCourse,
): GeneralCourseCatalogEntry[] => {
  const aliases = buildAliases(course);
  const matched = new Map<string, GeneralCourseCatalogEntry>();

  aliases.forEach((alias) => {
    const base = alias.replace(/[0-9]+$/, "");
    const exact = REQUIREMENT_POOL.filter((entry) => entry.normalized === alias);
    const byBase =
      exact.length > 0
        ? exact
        : REQUIREMENT_POOL.filter(
            (entry) => normalizeBase(entry.normalized) === base,
          );
    const hits =
      byBase.length > 0
        ? byBase
        : REQUIREMENT_POOL.filter((entry) => entry.normalized.includes(alias));

    hits.forEach((entry) => matched.set(entry.normalized, entry));
  });

  return [...matched.values()];
};

/** 매칭 강도. 큰 값이 먼저 배정된다. */
export const MATCH_SCORE = {
  /** 요건이 지목한 실제 과목과 이름이 같다 */
  EXACT_COURSE: 3,
  /** 요건이 지목한 과목과 끝자리만 다르다(대학수학 → 대학수학(1)) */
  COURSE_VARIANT: 2,
  /** 카탈로그로 풀리지 않은 요건을 카테고리 키워드로 잡았다 */
  CATEGORY_KEYWORD: 1,
  NONE: 0,
} as const;

export interface ResolvedRequirement {
  course: RequiredGeneralCourse;
  /** 요건이 가리키는 실제 과목들. 비어 있으면 카테고리 키워드로만 판정한다. */
  courses: GeneralCourseCatalogEntry[];
  aliases: string[];
}

export const resolveRequirement = (
  course: RequiredGeneralCourse,
): ResolvedRequirement => ({
  course,
  courses: resolveRequirementCourses(course),
  aliases: buildAliases(course),
});

/** 과목 하나가 요건 하나에 얼마나 잘 맞는지. 0이면 안 맞는다. */
export const scoreMatch = (
  requirement: ResolvedRequirement,
  subject: EvaluatedSubject,
): number => {
  const name = normalizeFull(subject.name);
  if (!name) return MATCH_SCORE.NONE;

  if (requirement.courses.some((entry) => entry.normalized === name)) {
    return MATCH_SCORE.EXACT_COURSE;
  }
  const base = normalizeBase(name);
  if (
    requirement.courses.some(
      (entry) => normalizeBase(entry.normalized) === base,
    ) ||
    requirement.aliases.some((alias) => name.includes(alias))
  ) {
    return MATCH_SCORE.COURSE_VARIANT;
  }

  // 카탈로그에 있는 요건인데 위에서 못 맞췄다면, 그 요건은 과목이 확정된 요건이다.
  // 키워드로 억지로 넓히면 다른 과목을 끌어오므로 여기서 끝낸다.
  if (requirement.courses.length > 0) return MATCH_SCORE.NONE;

  const { category } = requirement.course;
  const excluded = CATEGORY_EXCLUSIONS[category] ?? [];
  if (excluded.some((keyword) => name.includes(keyword))) {
    return MATCH_SCORE.NONE;
  }
  return CATEGORY_KEYWORDS[category].some((keyword) => name.includes(keyword))
    ? MATCH_SCORE.CATEGORY_KEYWORD
    : MATCH_SCORE.NONE;
};

export interface RequirementAssignment {
  /** requirements 인덱스별로 배정된 과목들 */
  matchedSubjects: EvaluatedSubject[][];
}

/**
 * 과목을 요건에 배정한다.
 *
 * 요건 순서대로 훑으면 위에 있는 광의 요건("영어")이 아래 요건(회화1·회화2)의 과목을
 * 먼저 먹어 버려서, 같은 과목 집합인데 입력 순서에 따라 판정이 달라졌다.
 * 그래서 (요건 × 과목) 쌍을 매칭 강도로 정렬해 강한 것부터 배정한다.
 */
export const assignSubjectsToRequirements = (
  requirements: ResolvedRequirement[],
  subjects: EvaluatedSubject[],
  /** 요건별로 그 과목을 후보로 볼지(전공 과목 제외 등) */
  isCandidate: (
    requirement: ResolvedRequirement,
    subject: EvaluatedSubject,
  ) => boolean,
): RequirementAssignment => {
  const pairs: {
    requirementIndex: number;
    subjectIndex: number;
    score: number;
  }[] = [];

  requirements.forEach((requirement, requirementIndex) => {
    subjects.forEach((subject, subjectIndex) => {
      if (!isCandidate(requirement, subject)) return;
      const score = scoreMatch(requirement, subject);
      if (score === MATCH_SCORE.NONE) return;
      pairs.push({ requirementIndex, subjectIndex, score });
    });
  });

  // 같은 강도면 요건 순서 → 과목 순서로 갈라 결과가 항상 같게 한다(Array#sort는 안정 정렬).
  pairs.sort((a, b) => b.score - a.score);

  const matchedSubjects: EvaluatedSubject[][] = requirements.map(() => []);
  const earned = requirements.map(() => 0);
  const consumed = new Set<number>();

  pairs.forEach(({ requirementIndex, subjectIndex }) => {
    if (consumed.has(subjectIndex)) return;
    const requirement = requirements[requirementIndex];
    if (earned[requirementIndex] >= requirement.course.credits) return;
    // 한 과목이 두 요건에 동시에 잡히지 않도록 소비한 과목을 기록한다.
    consumed.add(subjectIndex);
    earned[requirementIndex] += subjects[subjectIndex].credits;
    matchedSubjects[requirementIndex].push(subjects[subjectIndex]);
  });

  return { matchedSubjects };
};
