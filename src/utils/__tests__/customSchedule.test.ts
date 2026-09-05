import { describe, expect, it } from "vitest";
import { toCustomScheduleMeetings } from "../customSchedule";

describe("toCustomScheduleMeetings", () => {
  it("하나의 일정 슬롯에서 여러 요일을 meeting으로 펼친다", () => {
    const meetings = toCustomScheduleMeetings([
      {
        dayIndices: [0, 2, 4],
        startTime: "09:00",
        endTime: "10:30",
        location: "5호관",
      },
    ]);

    expect(meetings).toEqual([
      {
        day: "MONDAY",
        startTime: "09:00",
        endTime: "10:30",
        location: "5호관",
      },
      {
        day: "WEDNESDAY",
        startTime: "09:00",
        endTime: "10:30",
        location: "5호관",
      },
      {
        day: "FRIDAY",
        startTime: "09:00",
        endTime: "10:30",
        location: "5호관",
      },
    ]);
  });

  it("중복/범위 밖 요일 인덱스를 제거하고 장소 공백을 비운다", () => {
    const meetings = toCustomScheduleMeetings([
      {
        dayIndices: [1, 1, -1, 7],
        startTime: "13:00",
        endTime: "14:00",
        location: "   ",
      },
    ]);

    expect(meetings).toEqual([
      {
        day: "TUESDAY",
        startTime: "13:00",
        endTime: "14:00",
        location: undefined,
      },
    ]);
  });
});
