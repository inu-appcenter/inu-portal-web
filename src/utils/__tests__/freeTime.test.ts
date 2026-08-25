import { describe, expect, it } from "vitest";
import {
  busySlotKeysToBlocks,
  computeCommonFreeSlots,
  FREE_TIME_END_HOUR,
  FREE_TIME_START_HOUR,
  type BusyBlock,
} from "../freeTime";

const onlyMonday = { dayCount: 1 };

describe("computeCommonFreeSlots", () => {
  it("일정이 하나도 없으면 09:00~24:00 전체가 공강이다", () => {
    expect(computeCommonFreeSlots([], onlyMonday)).toEqual([
      {
        day: 0,
        startTime: FREE_TIME_START_HOUR,
        endTime: FREE_TIME_END_HOUR,
        duration: FREE_TIME_END_HOUR - FREE_TIME_START_HOUR,
      },
    ]);
  });

  it("여러 사람의 일정을 모두 피한 구간만 남긴다", () => {
    const me: BusyBlock[] = [{ day: 0, startTime: 9, endTime: 11 }];
    const friend: BusyBlock[] = [{ day: 0, startTime: 13, endTime: 15 }];

    expect(computeCommonFreeSlots([me, friend], onlyMonday)).toEqual([
      { day: 0, startTime: 11, endTime: 13, duration: 2 },
      { day: 0, startTime: 15, endTime: 24, duration: 9 },
    ]);
  });

  it("칸 안쪽에서만 겹치는 수업도 바쁜 시간으로 본다", () => {
    // 10:45~11:00 수업. 칸 시작점(10:30)만 보던 옛 방식은 이걸 놓쳤다.
    const me: BusyBlock[] = [{ day: 0, startTime: 10.75, endTime: 11 }];

    expect(computeCommonFreeSlots([me], onlyMonday)).toEqual([
      { day: 0, startTime: 9, endTime: 10.5, duration: 1.5 },
      { day: 0, startTime: 11, endTime: 24, duration: 13 },
    ]);
  });

  it("야간 일정도 공강에서 제외된다 (#336 - 24:00까지 계산)", () => {
    const me: BusyBlock[] = [{ day: 0, startTime: 19, endTime: 21 }];
    const slots = computeCommonFreeSlots([me], onlyMonday);

    expect(slots).toEqual([
      { day: 0, startTime: 9, endTime: 19, duration: 10 },
      { day: 0, startTime: 21, endTime: 24, duration: 3 },
    ]);
  });

  it("하루가 통째로 차 있으면 그 요일에는 공강이 없다", () => {
    const me: BusyBlock[] = [{ day: 0, startTime: 9, endTime: 24 }];
    expect(computeCommonFreeSlots([me], onlyMonday)).toEqual([]);
  });

  it("기본값은 월~금 5일을 본다", () => {
    const slots = computeCommonFreeSlots([]);
    expect(slots.map((slot) => slot.day)).toEqual([0, 1, 2, 3, 4]);
  });
});

describe("busySlotKeysToBlocks", () => {
  it("이어진 30분 칸을 하나의 블록으로 합친다", () => {
    expect(busySlotKeysToBlocks(["0-9", "0-9.5", "0-10"])).toEqual([
      { day: 0, startTime: 9, endTime: 10.5 },
    ]);
  });

  it("떨어진 칸은 별도 블록으로 나눈다", () => {
    expect(busySlotKeysToBlocks(["0-9", "0-13", "0-13.5"])).toEqual([
      { day: 0, startTime: 9, endTime: 9.5 },
      { day: 0, startTime: 13, endTime: 14 },
    ]);
  });

  it("요일별로 나눠서 합친다", () => {
    expect(busySlotKeysToBlocks(["1-20", "0-9", "1-20.5"])).toEqual([
      { day: 0, startTime: 9, endTime: 9.5 },
      { day: 1, startTime: 20, endTime: 21 },
    ]);
  });

  it("순서가 뒤섞이거나 중복된 칸도 처리한다", () => {
    expect(busySlotKeysToBlocks(["0-10", "0-9.5", "0-9.5", "0-9"])).toEqual([
      { day: 0, startTime: 9, endTime: 10.5 },
    ]);
  });

  it("빈 입력은 빈 배열", () => {
    expect(busySlotKeysToBlocks([])).toEqual([]);
  });
});
