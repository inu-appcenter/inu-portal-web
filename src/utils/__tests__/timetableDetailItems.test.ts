import { describe, expect, it } from "vitest";
import { mapDetailItemsToClassItems } from "../timetable";
import type { TimeTableDetailItem } from "@/types/timetables";

describe("mapDetailItemsToClassItems", () => {
  const courseItem = (
    overrides: Partial<TimeTableDetailItem["course"]> = {},
  ): TimeTableDetailItem => ({
    id: 10,
    type: "COURSE",
    memo: null,
    customSchedule: null,
    course: {
      courseOfferingId: 1001,
      courseId: 101,
      title: "자료구조",
      professor: "홍길동",
      subjectNumber: "CS101-01",
      credit: 3,
      meetings: [
        {
          id: 1,
          location: "정보기술대학 301호",
          sequence: 1,
          day: "MONDAY",
          startTime: "09:00",
          endTime: "10:30",
        },
        {
          id: 2,
          location: "정보기술대학 301호",
          sequence: 2,
          day: "WEDNESDAY",
          startTime: "09:00",
          endTime: "10:30",
        },
      ],
      ...overrides,
    },
  });

  it("gradeEvaluationName을 evaluation으로 옮긴다", () => {
    const items = mapDetailItemsToClassItems([
      courseItem({ gradeEvaluationName: "절대평가" }),
    ]);

    // 미팅 단위로 펼쳐지므로 모든 미팅이 같은 값을 들고 있어야 한다.
    expect(items).toHaveLength(2);
    expect(items.every((item) => item.evaluation === "절대평가")).toBe(true);
  });

  it("시간이 없는 강의도 evaluation을 넘긴다", () => {
    const [item] = mapDetailItemsToClassItems([
      courseItem({ meetings: [], gradeEvaluationName: "상대평가" }),
    ]);

    expect(item.isUntimed).toBe(true);
    expect(item.evaluation).toBe("상대평가");
  });

  it("서버가 평가 방식을 안 주면 비워 둔다", () => {
    const [item] = mapDetailItemsToClassItems([courseItem()]);

    expect(item.evaluation).toBeUndefined();
  });
});
