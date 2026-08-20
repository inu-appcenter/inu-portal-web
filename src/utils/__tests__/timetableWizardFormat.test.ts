import { describe, expect, it } from "vitest";
import {
  formatCourseMeetings,
  formatCourseMeta,
  mapWizardCoursesToClassItems,
} from "../timetableWizardFormat";
import type { WizardCourseOption } from "../../types/timetableWizard";

describe("timetableWizardFormat", () => {
  const courseA: WizardCourseOption = {
    courseId: 101,
    courseOfferingId: 1001,
    subjectNumber: "CS101-01",
    title: "자바프로그래밍",
    professor: "홍길동",
    credit: 3,
    department: "컴퓨터공학부",
    meetings: [
      { day: 0, startTime: 9, endTime: 10.5, location: "정보기술대학 301호" },
      { day: 2, startTime: 9, endTime: 10.5, location: "정보기술대학 301호" },
    ],
  };

  const courseB: WizardCourseOption = {
    courseId: 101,
    courseOfferingId: 1002,
    subjectNumber: "CS101-02",
    title: "자바프로그래밍",
    professor: "김철수",
    credit: 3,
    department: "컴퓨터공학부",
    meetings: [
      { day: 1, startTime: 13, endTime: 14.5, location: "정보기술대학 302호" },
    ],
  };

  const courseNoProfessor: WizardCourseOption = {
    courseId: 102,
    courseOfferingId: 1003,
    subjectNumber: "MATH101-01",
    title: "대학수학",
    professor: null,
    credit: 3,
    department: "수학과",
    meetings: [
      { day: 3, startTime: 10, endTime: 11.5, location: null },
    ],
  };

  describe("formatCourseMeetings", () => {
    it("formats multiple meetings correctly", () => {
      expect(formatCourseMeetings(courseA)).toBe("월 09:00~10:30, 수 09:00~10:30");
    });

    it("formats single meeting correctly", () => {
      expect(formatCourseMeetings(courseB)).toBe("화 13:00~14:30");
    });

    it("returns empty string when meetings is empty", () => {
      const emptyCourse: WizardCourseOption = {
        ...courseA,
        meetings: [],
      };
      expect(formatCourseMeetings(emptyCourse)).toBe("");
    });
  });

  describe("formatCourseMeta", () => {
    it("formats professor, subjectNumber, and meetings into meta string", () => {
      expect(formatCourseMeta(courseA)).toBe("홍길동 · CS101-01 · 월 09:00~10:30, 수 09:00~10:30");
    });

    it("distinguishes different sections of the same course", () => {
      const metaA = formatCourseMeta(courseA);
      const metaB = formatCourseMeta(courseB);
      expect(metaA).not.toBe(metaB);
      expect(metaA).toContain("CS101-01");
      expect(metaB).toContain("CS101-02");
    });

    it("handles null professor gracefully without trailing or broken separators", () => {
      expect(formatCourseMeta(courseNoProfessor)).toBe("MATH101-01 · 목 10:00~11:30");
    });

    it("handles empty meetings gracefully", () => {
      const courseNoMeetings: WizardCourseOption = {
        ...courseA,
        meetings: [],
      };
      expect(formatCourseMeta(courseNoMeetings)).toBe("홍길동 · CS101-01");
    });
  });
});

describe("mapWizardCoursesToClassItems", () => {
  const course: WizardCourseOption = {
    courseId: 101,
    courseOfferingId: 1002,
    subjectNumber: "CS101-02",
    title: "자바프로그래밍",
    professor: "김철수",
    credit: 3,
    department: "컴퓨터공학부",
    meetings: [
      { day: 1, startTime: 13, endTime: 14.5, location: "정보기술대학 302호" },
    ],
  };

  it("평가 방식을 ClassItem.evaluation으로 넘긴다", () => {
    const [item] = mapWizardCoursesToClassItems([
      { ...course, gradeEvaluationMethod: "절대평가" },
    ]);

    expect(item.evaluation).toBe("절대평가");
  });

  it("평가 방식이 없으면 비워 둔다", () => {
    const [item] = mapWizardCoursesToClassItems([course]);

    expect(item.evaluation).toBeUndefined();
  });
});
