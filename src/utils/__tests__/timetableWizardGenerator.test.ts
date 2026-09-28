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

  it("제외 시간대가 원인일 때도 문제가 된 필수 강의를 conflicts.courses에 담는다(#397)", () => {
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
    const slotConflict = result.conflicts.find((c) => c.label.includes("제외한 시간대"));
    expect(slotConflict?.courses?.map((c) => c.title)).toEqual(["자바프로그래밍"]);
  });
});

describe("generateWizardCandidates - 필수 분반 지정(#397)", () => {
  it("같은 과목의 여러 분반 중 하나만 필수로 찍으면, 그 분반만 조합에 포함된다", () => {
    const requiredSection = makeCourse({
      courseId: 5,
      courseOfferingId: 51,
      subjectNumber: "NET301-01",
      title: "컴퓨터네트워크",
      meetings: [{ day: 0, startTime: 9, endTime: 10.5, location: "401호" }], // 월
    });
    const otherSection = makeCourse({
      courseId: 5,
      courseOfferingId: 52,
      subjectNumber: "NET301-02",
      title: "컴퓨터네트워크",
      meetings: [{ day: 1, startTime: 13, endTime: 14.5, location: "402호" }], // 화
    });

    const result = generateWizardCandidates(
      makeConditions([
        { course: requiredSection, required: true },
        { course: otherSection, required: false },
      ]),
    );

    expect(result.candidates.length).toBeGreaterThan(0);
    for (const candidate of result.candidates) {
      const offeringIds = candidate.courses.map((c) => c.courseOfferingId);
      expect(offeringIds).toContain(51);
      expect(offeringIds).not.toContain(52);
    }
  });
});

describe("generateWizardCandidates - 새 시안(마법사) 표기", () => {
  const monday = makeCourse({
    courseId: 1,
    courseOfferingId: 1,
    subjectNumber: "CS101-01",
    title: "자바프로그래밍",
    meetings: [{ day: 0, startTime: 10, endTime: 11.5, location: null }],
  });
  const tuesdayEvening = makeCourse({
    courseId: 2,
    courseOfferingId: 2,
    subjectNumber: "CS102-01",
    title: "자료구조",
    meetings: [{ day: 1, startTime: 16.5, endTime: 18, location: null }],
  });

  it("후보 이름은 '마법사 A'부터 붙고 첫 후보만 추천이다", () => {
    const result = generateWizardCandidates(
      makeConditions([
        { course: monday, required: true },
        { course: tuesdayEvening, required: true },
      ]),
    );
    expect(result.candidates[0].label).toBe("마법사 A");
    expect(result.candidates[0].recommended).toBe(true);
  });

  it("야간 판정은 18시 이후 '종료' 기준이라 18:00 정각에 끝나는 수업은 야간이 아니다", () => {
    const result = generateWizardCandidates({
      ...makeConditions([{ course: tuesdayEvening, required: true }]),
      preference: { ...DEFAULT_PREFERENCE_CONDITIONS, noNightClasses: true },
    });
    const night = result.candidates[0].reasons.find((r) => r.tag?.label.includes("야간"));
    expect(night?.tag).toEqual({ label: "야간 없음", tone: "success" });
  });

  it("공강 최대화는 지정 공강 요일과 주말을 빼고 추가로 빈 평일만 센다", () => {
    const result = generateWizardCandidates({
      ...makeConditions([
        { course: monday, required: true },
        { course: tuesdayEvening, required: true },
      ]),
      preference: {
        ...DEFAULT_PREFERENCE_CONDITIONS,
        manyFreeDays: true,
        freeDayOfWeek: { enabled: true, days: [4] },
      },
    });
    const tags = result.candidates[0].reasons.map((r) => r.tag?.label);
    // 월·화 수업, 금 지정 공강 → 추가로 빈 평일은 수·목 2일
    expect(tags).toContain("공강 2일");
    expect(tags).toContain("금 공강");
  });

  it("공강 요일 때문에 조합이 없으면 kind=freeDay와 요일을 담는다", () => {
    const result = generateWizardCandidates({
      ...makeConditions([{ course: monday, required: true }]),
      preference: {
        ...DEFAULT_PREFERENCE_CONDITIONS,
        freeDayOfWeek: { enabled: true, days: [0] },
      },
    });
    expect(result.candidates).toHaveLength(0);
    expect(result.conflicts[0]).toMatchObject({ kind: "freeDay", days: [0] });
  });

  it("목표 학점에 못 미치면 kind=credit과 가능한 학점 목록을 담는다", () => {
    const result = generateWizardCandidates({
      ...makeConditions([
        { course: monday, required: false },
        { course: tuesdayEvening, required: false },
      ]),
      basic: {
        semester: null,
        minCredit: 18,
        maxCredit: 18,
        wishlist: [
          { course: monday, required: false },
          { course: tuesdayEvening, required: false },
        ],
      },
    });
    expect(result.candidates).toHaveLength(0);
    expect(result.conflicts[0].kind).toBe("credit");
    expect(result.conflicts[0].achievableCredits?.at(-1)).toBe(6);
  });
});

describe("generateWizardCandidates - 전부 선택(비필수) 강의일 때 원인 진단", () => {
  const mon = (id: number, credit: number, start: number) =>
    makeCourse({
      courseId: id,
      courseOfferingId: id,
      subjectNumber: `S${id}`,
      title: `과목${id}`,
      credit,
      meetings: [{ day: 0, startTime: start, endTime: start + 1.5, location: null }],
    });
  const withTarget = (wishlist: WizardWishlistItem[], credit: number): WizardConditions => ({
    ...makeConditions(wishlist),
    basic: { semester: null, minCredit: credit, maxCredit: credit, wishlist },
  });

  it("공강 요일 때문에 빠진 강의가 있어야 학점을 채울 수 있으면 freeDay로 짚는다", () => {
    const a = mon(1, 3, 9);
    const b = { ...mon(2, 3, 9), meetings: [{ day: 1, startTime: 9, endTime: 10.5, location: null }] };
    const result = generateWizardCandidates({
      ...withTarget([{ course: a, required: false }, { course: b, required: false }], 6),
      preference: { ...DEFAULT_PREFERENCE_CONDITIONS, freeDayOfWeek: { enabled: true, days: [0] } },
    });
    expect(result.conflicts[0]).toMatchObject({ kind: "freeDay", days: [0] });
    expect(result.conflicts[0].courses?.map((c) => c.title)).toEqual(["과목1"]);
  });

  it("겹치는 두 강의를 모두 넣어야만 학점을 채울 수 있으면 overlap으로 두 강의를 짚는다", () => {
    const result = generateWizardCandidates(
      withTarget(
        [
          { course: mon(1, 3, 9), required: false },
          { course: mon(2, 3, 9.5), required: false },
        ],
        6,
      ),
    );
    expect(result.conflicts[0].kind).toBe("overlap");
    expect(result.conflicts[0].courses).toHaveLength(2);
  });

  it("다 넣어도 학점이 모자라면 credit으로 짚는다", () => {
    const result = generateWizardCandidates(
      withTarget([{ course: mon(1, 3, 9), required: false }], 18),
    );
    expect(result.conflicts[0].kind).toBe("credit");
  });
});
