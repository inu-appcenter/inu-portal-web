import { describe, expect, it } from "vitest";
import { calculateCommonFreeSlots, parseTimeToHours } from "../timetable";

const busy = (day: number, startTime: number, endTime: number) => ({
  day,
  startTime,
  endTime,
});

describe("calculateCommonFreeSlots", () => {
  it("아무도 수업이 없는 요일은 탐색 범위 전체가 공강이다", () => {
    const result = calculateCommonFreeSlots([[], []]);
    const monday = result.filter((s) => s.day === 0);

    expect(monday).toEqual([
      { day: 0, startTime: 9, endTime: 18, duration: 9 },
    ]);
  });

  it("맞닿은(back-to-back) 수업 사이에는 공강이 생기지 않는다", () => {
    // A: 9~10, B: 10~11 (같은 사람 또는 다른 사람이어도 동일)
    const result = calculateCommonFreeSlots([
      [busy(0, 9, 10)],
      [busy(0, 10, 11)],
    ]);

    const monday = result.filter((s) => s.day === 0);
    expect(monday).toEqual([
      { day: 0, startTime: 11, endTime: 18, duration: 7 },
    ]);
  });

  it("여러 사람의 겹치는/떨어진 수업을 모두 합쳐 공통 공강을 계산한다 (3인 이상)", () => {
    // 나: 9~10.5, 10~13 (겹침)
    // 친구1: 14~15
    // 친구2: 15.5~16 -> 15~15.5 사이 30분 공강 발생
    const result = calculateCommonFreeSlots([
      [busy(0, 9, 10.5), busy(0, 10, 13)],
      [busy(0, 14, 15)],
      [busy(0, 15.5, 16)],
    ]);

    const monday = result.filter((s) => s.day === 0);
    expect(monday).toEqual([
      { day: 0, startTime: 13, endTime: 14, duration: 1 },
      { day: 0, startTime: 15, endTime: 15.5, duration: 0.5 },
      { day: 0, startTime: 16, endTime: 18, duration: 2 },
    ]);
  });

  it("30분 미만의 자투리 공강은 목록에서 제외한다", () => {
    const result = calculateCommonFreeSlots([
      [busy(0, 9, 12)],
      [busy(0, 12.2, 15)], // 12:00~12:12 사이 12분 자투리
    ]);

    const monday = result.filter((s) => s.day === 0);
    expect(monday).toEqual([
      { day: 0, startTime: 15, endTime: 18, duration: 3 },
    ]);
  });

  it("50분 수업처럼 이진수로 딱 떨어지지 않는 시각도 30분 경계를 정확히 판정한다", () => {
    // 9:00~9:50, 10:20~11:10 -> 9:50~10:20 사이 정확히 30분 공강
    const start1 = parseTimeToHours("09:00");
    const end1 = parseTimeToHours("09:50");
    const start2 = parseTimeToHours("10:20");
    const end2 = parseTimeToHours("11:10");

    const result = calculateCommonFreeSlots([
      [busy(0, start1, end1), busy(0, start2, end2)],
    ]);

    const gap = result.find(
      (s) => s.day === 0 && Math.abs(s.startTime - end1) < 1e-9,
    );
    expect(gap).toBeDefined();
    expect(gap?.duration).toBeCloseTo(0.5, 9);
    expect(Math.round((gap?.duration ?? 0) * 60)).toBe(30);
  });

  it("탐색 범위(9~18시) 밖의 수업은 클램프되어 반영된다", () => {
    // 8~9.5 수업 -> 9~9.5까지만 바쁜 것으로 처리
    const result = calculateCommonFreeSlots([[busy(0, 8, 9.5)]]);
    const monday = result.filter((s) => s.day === 0);

    expect(monday).toEqual([
      { day: 0, startTime: 9.5, endTime: 18, duration: 8.5 },
    ]);
  });

  it("입력이 빈 배열이어도 안전하게 동작한다 (요일마다 탐색 범위 전체가 공강)", () => {
    const result = calculateCommonFreeSlots([]);
    expect(result).toHaveLength(5);
    expect(result.every((s) => s.startTime === 9 && s.endTime === 18)).toBe(
      true,
    );
  });

  it("요일마다 독립적으로 계산한다", () => {
    const result = calculateCommonFreeSlots([
      [busy(0, 9, 18)], // 월요일 종일 수업
      [busy(1, 9, 10)],
    ]);

    expect(result.some((s) => s.day === 0)).toBe(false);
    expect(result.filter((s) => s.day === 1)).toEqual([
      { day: 1, startTime: 10, endTime: 18, duration: 8 },
    ]);
  });
});
