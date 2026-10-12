import { describe, it, expect, vi } from "vitest";
import { resolvePortalTimetableItems } from "../resolvePortalTimetableOfferings";
import * as courseOfferingsApi from "../../apis/courseOfferings";
import type { CourseOffering } from "../../types/courseOfferings";
import type { TimetableCourseItem } from "../ssvParser";

describe("resolvePortalTimetableItems", () => {
  const mockOfferings: CourseOffering[] = [
    {
      id: 101,
      courseId: 1,
      courseTitle: "자연어처리",
      departmentName: "컴퓨터공학부",
      professor: "신유현",
      credit: 3,
      subjectNumber: "0010925001",
      courseCode: "0010925",
      year: 2026,
      term: "FIRST",
      meetings: [
        {
          day: "FRIDAY",
          startTime: "09:00:00",
          endTime: "12:00:00",
          location: "07-304",
        },
      ],
      isMajor: true,
      grade: "3학년",
    },
    {
      id: 102,
      courseId: 2,
      courseTitle: "운영체제",
      departmentName: "컴퓨터공학부",
      professor: "홍길동",
      credit: 3,
      subjectNumber: "0005103001",
      courseCode: "0005103",
      year: 2026,
      term: "FIRST",
      meetings: [],
      isMajor: true,
      grade: "3학년",
    },
  ];

  const mockItem1: TimetableCourseItem = {
    courseName: "자연어처리",
    courseCode: "0010925001",
    credits: "3",
    professorName: "신유현",
    courseType: "전공심화",
    departmentName: "컴퓨터공학부",
    targetGrade: "3",
    lessonType: "e-Learning",
    timeInfoRaw: "[07-304:금(1)(2)(3)]",
    timeSlots: [{ day: "금", periods: "(1)(2)(3)", building: "7호관", room: "304호" }],
    year: "2026",
    semester: "1학기",
    status: "신청",
  };

  const mockItem2: TimetableCourseItem = {
    courseName: "알 수 없는 과목",
    courseCode: "9999999001",
    credits: "2",
    professorName: "김교수",
    courseType: "교양",
    departmentName: "교양",
    targetGrade: "전학년",
    lessonType: "강의",
    timeInfoRaw: "",
    timeSlots: [],
    year: "2026",
    semester: "1학기",
    status: "신청",
  };

  it("수강번호가 정확히 일치하는 개설강의를 MATCHED_EXACT로 매칭해야 한다", async () => {
    vi.spyOn(courseOfferingsApi, "searchCourseOfferings").mockResolvedValue(mockOfferings);

    const results = await resolvePortalTimetableItems([mockItem1], 2026, "FIRST");
    expect(results).toHaveLength(1);
    expect(results[0].matchStatus).toBe("MATCHED_EXACT");
    expect(results[0].offering?.id).toBe(101);
    expect(results[0].isSelected).toBe(true);
    expect(results[0].isAlreadyAdded).toBe(false);
  });

  it("이미 시간표에 등록된 강의는 isAlreadyAdded가 true이고 isSelected가 false여야 한다", async () => {
    vi.spyOn(courseOfferingsApi, "searchCourseOfferings").mockResolvedValue(mockOfferings);

    const results = await resolvePortalTimetableItems(
      [mockItem1],
      2026,
      "FIRST",
      [101],
      ["0010925001"],
    );
    expect(results).toHaveLength(1);
    expect(results[0].isAlreadyAdded).toBe(true);
    expect(results[0].isSelected).toBe(false);
  });

  it("개설강의를 찾지 못한 경우 UNMATCHED 상태가 되어야 한다", async () => {
    vi.spyOn(courseOfferingsApi, "searchCourseOfferings").mockResolvedValue([]);

    const results = await resolvePortalTimetableItems([mockItem2], 2026, "FIRST");
    expect(results).toHaveLength(1);
    expect(results[0].matchStatus).toBe("UNMATCHED");
    expect(results[0].offering).toBeNull();
    expect(results[0].isSelected).toBe(false);
  });
});
