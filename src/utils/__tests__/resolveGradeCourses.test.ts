import { describe, expect, it } from "vitest";
import { resolveGradeCourses } from "../resolveGradeCourses";
import type { Course } from "@/types/courses";
import type { ParsedGradeRow } from "@/types/gradeImport";

const course = (overrides: Partial<Course>): Course => ({
  id: 1,
  title: "자바프로그래밍",
  departmentCode: "0000077",
  departmentName: "컴퓨터공학부",
  collegeCode: "",
  collegeName: "",
  targetGradeCode: "",
  targetGradeName: "",
  targetTermCode: "",
  targetTermName: "",
  completionDivisionCode: "",
  completionDivisionName: "전공기초",
  credit: 2,
  content: "",
  active: true,
  ...overrides,
});

const row = (overrides: Partial<ParsedGradeRow>): ParsedGradeRow => ({
  title: "자바프로그래밍",
  courseCode: "IAA6011",
  credit: 3,
  grade: "A0",
  isuName: "전공기초",
  isuFldName: "전공기초",
  note: null,
  voided: false,
  ...overrides,
});

describe("resolveGradeCourses", () => {
  // semester를 주지 않으면 개설강의 보강 조회 없이 과목명 매칭만 돌아 API를 타지 않는다.
  it("교과 개편으로 학점이 바뀌어도 성적표에 적힌 이수 학점을 유지한다", async () => {
    // 개설 학점은 2학점으로 줄었지만 사용자는 3학점이던 시절에 들었다.
    const [resolved] = await resolveGradeCourses([row({})], [course({})]);

    expect(resolved.matchStatus).toBe("MATCHED_BY_TITLE");
    expect(resolved.courseId).toBe(1);
    expect(resolved.resolvedCredit).toBe(3);
  });

  it("학점 열이 안 딸려온 행만 매칭된 강의의 학점으로 메운다", async () => {
    const [resolved] = await resolveGradeCourses(
      [row({ credit: null })],
      [course({})],
    );

    expect(resolved.resolvedCredit).toBe(2);
  });

  it("매칭에 실패해도 성적표 학점은 그대로 남는다", async () => {
    const [resolved] = await resolveGradeCourses([row({})], []);

    expect(resolved.matchStatus).toBe("UNMATCHED");
    expect(resolved.resolvedCredit).toBe(3);
  });

  it("학점이 다른 동명 과목이라도 후보에서 통째로 떨어뜨리지 않는다", async () => {
    // 학점으로 좁혀서 남는 게 없으면 좁히기 전 후보를 유지한다(narrow).
    const [resolved] = await resolveGradeCourses(
      [row({})],
      [course({ id: 7, credit: 2 })],
    );

    expect(resolved.courseId).toBe(7);
    expect(resolved.resolvedCredit).toBe(3);
  });
});
