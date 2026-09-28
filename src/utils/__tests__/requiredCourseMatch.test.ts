import { describe, expect, it } from "vitest";
import { resolveRequirement, scoreMatch } from "../requiredCourseMatch";
import type {
  EvaluatedSubject,
  RequiredGeneralCourse,
} from "../../types/graduation";

const subject = (name: string): EvaluatedSubject => ({
  name,
  credits: 2,
  isMajor: false,
  passed: true,
});

const matches = (course: RequiredGeneralCourse, name: string) =>
  scoreMatch(resolveRequirement(course), subject(name)) > 0;

describe("필수 교양 요건 별칭", () => {
  it("띄어쓴 요건명의 조각이 다른 과목을 끌어오지 않는다", () => {
    const writing: RequiredGeneralCourse = {
      courseName: "글쓰기 이론과 실제",
      credits: 2,
      category: "국어",
    };

    expect(matches(writing, "글쓰기이론과실제")).toBe(true);
    expect(matches(writing, "미디어글쓰기")).toBe(false);
    expect(matches(writing, "도시계획이론과역사")).toBe(false);
  });

  it("영어 요건이 심화교양 영어 과목으로 채워지지 않는다", () => {
    const english: RequiredGeneralCourse = {
      courseName: "영어(대학영어 또는 Academic English)",
      credits: 2,
      category: "영어",
    };

    expect(matches(english, "Academic English")).toBe(true);
    expect(matches(english, "대학영어1")).toBe(true);
    expect(matches(english, "ENGLISH PRESENTATION")).toBe(false);
    // 회화는 별도 요건이다.
    expect(matches(english, "대학영어회화1")).toBe(false);
  });

  it("SW 요건이 '사고와'가 들어간 핵심교양으로 채워지지 않는다", () => {
    const sw: RequiredGeneralCourse = {
      courseName: "컴퓨팅적사고와 SW",
      credits: 2,
      category: "SW",
    };

    expect(matches(sw, "컴퓨팅적사고와SW")).toBe(true);
    expect(matches(sw, "창의적사고와문제해결")).toBe(false);
  });

  it("학과가 지정한 대체 과목 조각은 그대로 별칭으로 쓴다", () => {
    const substitute: RequiredGeneralCourse = {
      courseName: "SW(=전공필수 기계기초프로그래밍)",
      credits: 2,
      category: "SW",
    };

    expect(matches(substitute, "기계기초프로그래밍")).toBe(true);
  });
});
