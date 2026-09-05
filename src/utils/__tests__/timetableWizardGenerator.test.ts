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

  it("제외 시간대가 원인일 때, 그 시간대에 걸리는 필수 강의를 conflicts.courses에 담는다", () => {
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
    const target = result.conflicts.find((c) => c.label.includes("제외한 시간대"));
    expect(target?.courses?.map((c) => c.title)).toEqual(["자바프로그래밍"]);
  });

  it("같은 과목의 여러 분반 중 특정 분반만 필수로 지정하면, 그 분반이 다른 분반으로 대체되지 않는다", () => {
    // 컴퓨터 네트워크 월수(필수로 지정) vs 화목(선택 취급되는 대안) - QA에서 보고된
    // "필수로 선택한 강의가 조합에서 빠진다"의 재현 케이스.
    const requiredSection = makeCourse({
      courseId: 10,
      courseOfferingId: 101,
      subjectNumber: "NET101-01",
      title: "컴퓨터 네트워크",
      meetings: [{ day: 0, startTime: 10, endTime: 11.5, location: "301호" }],
    });
    const otherSection = makeCourse({
      courseId: 10,
      courseOfferingId: 102,
      subjectNumber: "NET101-02",
      title: "컴퓨터 네트워크",
      meetings: [{ day: 1, startTime: 9, endTime: 10.5, location: "301호" }],
    });

    const result = generateWizardCandidates(
      makeConditions([
        { course: requiredSection, required: true },
        { course: otherSection, required: false },
      ]),
    );

    expect(result.candidates.length).toBeGreaterThan(0);
    for (const candidate of result.candidates) {
      expect(
        candidate.courses.some((c) => c.courseOfferingId === requiredSection.courseOfferingId),
      ).toBe(true);
    }
  });
});
