import { describe, expect, it } from "vitest";
import { generateWizardCandidates } from "../timetableWizardGenerator";
import {
  DEFAULT_EXCLUSION_CONDITIONS,
  DEFAULT_PREFERENCE_CONDITIONS,
} from "../../types/timetableWizard";
import type {
  WizardConditions,
  WizardCourseOption,
  WizardWishlistItem,
} from "../../types/timetableWizard";

const makeCourse = (overrides: Partial<WizardCourseOption>): WizardCourseOption => ({
  courseId: 1,
  courseOfferingId: 1,
  subjectNumber: "CS101-01",
  title: "자바프로그래밍",
  professor: "홍길동",
  credit: 3,
  department: "컴퓨터공학부",
  meetings: [],
  ...overrides,
});

const makeConditions = (wishlist: WizardWishlistItem[]): WizardConditions => ({
  basic: {
    semester: null,
    minCredit: 0,
    maxCredit: 30,
    wishlist,
  },
  preference: DEFAULT_PREFERENCE_CONDITIONS,
  exclusion: DEFAULT_EXCLUSION_CONDITIONS,
});

describe("generateWizardCandidates - 실패 원인 진단", () => {
  it("필수 강의 두 개가 시간이 겹치면, 겹치는 두 강의를 conflicts.courses에 구체적으로 담는다", () => {
    const courseA = makeCourse({
      courseId: 1,
      subjectNumber: "CS101-01",
      title: "자바프로그래밍",
      professor: "홍길동",
      meetings: [{ day: 1, startTime: 10, endTime: 11.5, location: "301호" }],
    });
    const courseB = makeCourse({
      courseId: 2,
      subjectNumber: "MATH101-01",
      title: "대학수학",
      professor: "박영희",
      meetings: [{ day: 1, startTime: 10.5, endTime: 12, location: "302호" }],
    });

    const result = generateWizardCandidates(
      makeConditions([
        { course: courseA, required: true },
        { course: courseB, required: true },
      ]),
    );

    expect(result.candidates).toHaveLength(0);
    expect(result.conflicts).toHaveLength(1);
    expect(result.conflicts[0].label).toBe("담은 강의끼리 시간이 겹쳐요");
    expect(result.conflicts[0].courses).toHaveLength(2);
    const titles = result.conflicts[0].courses?.map((c) => c.title);
    expect(titles).toEqual(["자바프로그래밍", "대학수학"]);
  });

  it("선택(optional) 과목은 시간이 겹쳐도 통째로 빠질 수 있어 겹침의 원인으로 지목하지 않는다", () => {
    const required = makeCourse({
      courseId: 1,
      subjectNumber: "CS101-01",
      title: "자바프로그래밍",
      meetings: [{ day: 1, startTime: 10, endTime: 11.5, location: "301호" }],
    });
    const optional = makeCourse({
      courseId: 2,
      subjectNumber: "MATH101-01",
      title: "대학수학",
      meetings: [{ day: 1, startTime: 10.5, endTime: 12, location: "302호" }],
    });

    const result = generateWizardCandidates(
      makeConditions([
        { course: required, required: true },
        { course: optional, required: false },
      ]),
    );

    // optional 과목을 빼면 조합이 성립하므로 실패가 아니라 성공 케이스가 되어야 한다
    expect(result.conflicts).toHaveLength(0);
    expect(result.candidates.length).toBeGreaterThan(0);
  });

  it("겹치지 않는 분반이 하나라도 있으면 그 그룹 쌍은 원인으로 지목하지 않는다", () => {
    const courseA = makeCourse({
      courseId: 1,
      subjectNumber: "CS101-01",
      title: "자바프로그래밍",
      meetings: [{ day: 1, startTime: 10, endTime: 11.5, location: "301호" }],
    });
    // 같은 과목(courseId=2)의 두 분반 - 하나는 겹치고 하나는 안 겹침
    const courseBOverlapping = makeCourse({
      courseId: 2,
      courseOfferingId: 21,
      subjectNumber: "MATH101-01",
      title: "대학수학",
      meetings: [{ day: 1, startTime: 10.5, endTime: 12, location: "302호" }],
    });
    const courseBFree = makeCourse({
      courseId: 2,
      courseOfferingId: 22,
      subjectNumber: "MATH101-02",
      title: "대학수학",
      meetings: [{ day: 2, startTime: 10, endTime: 11.5, location: "303호" }],
    });

    const result = generateWizardCandidates(
      makeConditions([
        { course: courseA, required: true },
        { course: courseBOverlapping, required: true },
        { course: courseBFree, required: true },
      ]),
    );

    expect(result.conflicts).toHaveLength(0);
    expect(result.candidates.length).toBeGreaterThan(0);
  });

  it("제외 시간대가 원인일 때는 courses 없이 label만 담는다(기존 동작 유지)", () => {
    const course = makeCourse({
      meetings: [{ day: 1, startTime: 10, endTime: 11.5, location: "301호" }],
    });

    const conditions = makeConditions([{ course, required: true }]);
    conditions.exclusion = {
      ...DEFAULT_EXCLUSION_CONDITIONS,
      excludedSlots: ["1-10"],
    };

    const result = generateWizardCandidates(conditions);

    expect(result.candidates).toHaveLength(0);
    expect(result.conflicts.length).toBeGreaterThan(0);
    expect(result.conflicts.some((c) => c.label.includes("제외한 시간대"))).toBe(true);
    expect(result.conflicts.every((c) => c.courses === undefined)).toBe(true);
  });
});
