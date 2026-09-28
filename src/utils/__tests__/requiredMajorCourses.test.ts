import { describe, expect, it } from "vitest";
import {
  findRequiredMajorCourses,
  loadRequiredMajorCourses,
  matchRequiredMajorCourses,
  normalizeMajorCourseName,
} from "../requiredMajorCourses";
import {
  evaluateGraduation,
  resolveGraduationRule,
} from "../graduationRequirements";
import type {
  EvaluatedSubject,
  RequiredMajorCourse,
  RequiredMajorCourseSet,
} from "../../types/graduation";

const subject = (
  name: string,
  options: Partial<EvaluatedSubject> = {},
): EvaluatedSubject => ({
  name,
  credits: 3,
  isMajor: true,
  passed: true,
  ...options,
});

const SETS: RequiredMajorCourseSet[] = [
  { startYear: 2016, endYear: 2022, courses: [["자료구조", 3, "전공필수"]] },
  { startYear: 2023, endYear: 2099, courses: [["알고리즘", 3, "전공핵심"]] },
];

describe("findRequiredMajorCourses", () => {
  it("입학연도 구간에 맞는 교육과정을 고른다", () => {
    expect(findRequiredMajorCourses(SETS, 2019)?.[0][0]).toBe("자료구조");
    expect(findRequiredMajorCourses(SETS, 2030)?.[0][0]).toBe("알고리즘");
  });

  it("교육과정표가 없는 학번은 가까운 연도로 대체하지 않는다", () => {
    expect(findRequiredMajorCourses(SETS, 2012)).toBeNull();
    expect(findRequiredMajorCourses(undefined, 2023)).toBeNull();
  });
});

describe("normalizeMajorCourseName", () => {
  it("괄호·공백·로마 숫자 표기 차이를 없앤다", () => {
    expect(normalizeMajorCourseName("C언어프로그래밍(2)")).toBe(
      normalizeMajorCourseName("C언어프로그래밍2"),
    );
    expect(normalizeMajorCourseName("자기설계세미나 I")).toBe(
      normalizeMajorCourseName("자기설계세미나Ⅰ"),
    );
    expect(normalizeMajorCourseName("자기설계세미나II")).not.toBe(
      normalizeMajorCourseName("자기설계세미나 I"),
    );
  });

  it("단어 안의 대문자 I는 숫자로 바꾸지 않는다", () => {
    expect(normalizeMajorCourseName("AI비젼시스템")).toBe("ai비젼시스템");
  });
});

describe("matchRequiredMajorCourses", () => {
  const courses: RequiredMajorCourse[] = [
    ["C언어프로그래밍(1)", 2, "전공기초"],
    ["C언어프로그래밍(2)", 2, "전공기초"],
  ];

  it("번호가 다른 과목은 서로 인정하지 않는다", () => {
    const result = matchRequiredMajorCourses(courses, [
      subject("C언어프로그래밍1"),
    ]);

    expect(result.map((course) => course.done)).toEqual([true, false]);
  });

  it("학점을 못 딴 과목은 이수로 보지 않는다", () => {
    const result = matchRequiredMajorCourses(courses, [
      subject("C언어프로그래밍(2)", { passed: false }),
    ]);

    expect(result[1].done).toBe(false);
  });
});

describe("학과 교육과정표 데이터", () => {
  it("임베디드시스템공학과는 학번마다 C언어프로그래밍(2)가 전공필수다", async () => {
    for (const year of [2016, 2021, 2026]) {
      const courses = await loadRequiredMajorCourses("EMBEDDED_SYSTEM", year);
      expect(courses?.map(([name]) => name)).toContain("C언어프로그래밍(2)");
    }
  });

  it("판정 결과에 전공필수 과목을 싣는다", async () => {
    const courses = await loadRequiredMajorCourses("EMBEDDED_SYSTEM", 2021);
    const rule = resolveGraduationRule("EMBEDDED_SYSTEM", 2021)!.rule;
    const evaluation = evaluateGraduation(
      rule,
      [subject("C언어프로그래밍(1)")],
      "EMBEDDED_SYSTEM",
      { requiredMajorCourses: courses },
    );
    const byName = Object.fromEntries(
      (evaluation.requiredMajorCourses ?? []).map((course) => [
        course.courseName,
        course.done,
      ]),
    );

    expect(byName["C언어프로그래밍(1)"]).toBe(true);
    expect(byName["C언어프로그래밍(2)"]).toBe(false);
  });
});
