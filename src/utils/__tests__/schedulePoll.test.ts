import { describe, expect, it } from "vitest";
import {
  buildOverlayItems,
  buildPollColumns,
  cellsToRanges,
  getPollGridShape,
  overlayBlockedCells,
  rangesToCells,
  timeRangeToRows,
} from "../schedulePoll";
import {
  buildPollHeatmap,
  computePollCandidates,
} from "../schedulePollResult";
import type { TimeTableDetailItem } from "@/types/timetables";

const recurringShape = (days: ("MON" | "TUE" | "WED")[] = ["MON", "TUE"]) =>
  getPollGridShape({
    columns: buildPollColumns({
      isRecurring: true,
      days,
      startDate: null,
      endDate: null,
    }),
    rangeStart: "09:00",
    rangeEnd: "18:00",
  });

describe("buildPollColumns", () => {
  it("정기 약속은 선택한 요일만 월→일 순으로 만든다", () => {
    const columns = buildPollColumns({
      isRecurring: true,
      days: ["FRI", "MON"],
      startDate: null,
      endDate: null,
    });
    expect(columns.map((c) => c.key)).toEqual(["MON", "FRI"]);
  });

  it("일회성은 시작일~종료일을 전부 열로 만든다", () => {
    const columns = buildPollColumns({
      isRecurring: false,
      days: null,
      startDate: "2026-10-30",
      endDate: "2026-11-02",
    });
    expect(columns.map((c) => c.key)).toEqual([
      "2026-10-30",
      "2026-10-31",
      "2026-11-01",
      "2026-11-02",
    ]);
    expect(columns[0].label).toBe("10/30 (금)");
  });
});

describe("구간 ↔ 칸 변환", () => {
  it("구간을 칸으로 바꿨다가 다시 구간으로 합치면 같은 값이 나온다", () => {
    const shape = recurringShape();
    const ranges = [
      { key: "MON", start: "10:00", end: "12:30" },
      { key: "TUE", start: "09:00", end: "09:30" },
      { key: "TUE", start: "17:00", end: "18:00" },
    ];
    expect(cellsToRanges(shape, rangesToCells(shape, ranges))).toEqual(ranges);
  });

  it("겹치거나 붙은 구간은 하나로 합쳐진다", () => {
    const shape = recurringShape();
    const cells = rangesToCells(shape, [
      { key: "MON", start: "10:00", end: "11:00" },
      { key: "MON", start: "11:00", end: "12:00" },
      { key: "MON", start: "11:30", end: "13:00" },
    ]);
    expect(cellsToRanges(shape, cells)).toEqual([
      { key: "MON", start: "10:00", end: "13:00" },
    ]);
  });

  it("하루의 끝은 24:00으로 적는다", () => {
    const shape = getPollGridShape({
      columns: [{ key: "MON", label: "월" }],
      rangeStart: "22:00",
      rangeEnd: "24:00",
    });
    const cells = rangesToCells(shape, [
      { key: "MON", start: "23:00", end: "24:00" },
    ]);
    expect(cellsToRanges(shape, cells)).toEqual([
      { key: "MON", start: "23:00", end: "24:00" },
    ]);
  });

  it("30분 경계와 맞지 않는 수업은 걸친 칸 전체를 차지한다", () => {
    // 10:15~11:45 → 10:00~12:00 (09:00 시작 그리드의 2~6번 칸)
    expect(timeRangeToRows(recurringShape(), "10:15", "11:45")).toEqual([2, 6]);
  });

  it("그리드 범위 밖은 잘라 낸다", () => {
    expect(timeRangeToRows(recurringShape(), "08:00", "09:30")).toEqual([0, 1]);
    expect(timeRangeToRows(recurringShape(), "19:00", "20:00")).toEqual([18, 18]);
  });
});

describe("시간표 오버레이", () => {
  const items: TimeTableDetailItem[] = [
    {
      id: 1,
      type: "COURSE",
      memo: null,
      customSchedule: null,
      course: {
        courseOfferingId: 4412,
        courseId: 1,
        title: "자료구조",
        professor: null,
        subjectNumber: null,
        credit: 3,
        meetings: [
          {
            id: 1,
            location: null,
            sequence: null,
            day: "MONDAY",
            startTime: "10:15",
            endTime: "11:45",
          },
          {
            id: 2,
            location: null,
            sequence: null,
            day: "THURSDAY",
            startTime: "10:00",
            endTime: "11:00",
          },
        ],
      },
    },
  ];

  it("조율에 없는 요일의 수업은 블록을 만들지 않는다", () => {
    const [item] = buildOverlayItems(recurringShape(), items);
    expect(item.blocks).toEqual([{ column: 0, rowStart: 2, rowEnd: 6 }]);
    expect(item.courseOfferingId).toBe(4412);
  });

  it("포함한 수업의 칸만 불가능으로 잡는다", () => {
    const shape = recurringShape();
    const overlay = buildOverlayItems(shape, items);
    expect(overlayBlockedCells(shape, overlay, new Set()).some(Boolean)).toBe(false);
    const blocked = overlayBlockedCells(shape, overlay, new Set(["1"]));
    expect(cellsToRanges(shape, blocked)).toEqual([
      { key: "MON", start: "10:00", end: "12:00" },
    ]);
  });

  it("일회성 조율은 학기 밖 날짜에 수업을 적용하지 않는다", () => {
    const shape = getPollGridShape({
      columns: buildPollColumns({
        isRecurring: false,
        days: null,
        startDate: "2026-12-14", // 월
        endDate: "2026-12-21", // 다음 주 월
      }),
      rangeStart: "09:00",
      rangeEnd: "18:00",
    });
    const [item] = buildOverlayItems(shape, items, {
      startDate: "2026-09-01",
      endDate: "2026-12-18",
    });
    // 12/14(월), 12/17(목)만 학기 안이다. 12/21(월)은 종강 뒤라 빠진다.
    expect(item.blocks.map((b) => shape.columns[b.column].key)).toEqual([
      "2026-12-14",
      "2026-12-17",
    ]);
  });
});

describe("computePollCandidates", () => {
  const compute = (
    shape: ReturnType<typeof recurringShape>,
    people: { key: string; start: string; end: string }[][],
    durationMode: "FIXED" | "AT_LEAST" = "FIXED",
    durationMin = 60,
  ) =>
    computePollCandidates({
      shape,
      heatmap: buildPollHeatmap(
        shape,
        people.map((ranges) => rangesToCells(shape, ranges)),
      ),
      participantCount: people.length,
      durationMode,
      durationMin,
    });

  it("이어지는 같은 인원 후보는 가장 빠른 것 하나로 합친다", () => {
    const shape = recurringShape();
    const candidates = compute(shape, [
      [{ key: "MON", start: "10:00", end: "13:00" }],
      [{ key: "MON", start: "10:00", end: "13:00" }],
    ]);
    expect(candidates).toHaveLength(1);
    expect(candidates[0]).toMatchObject({
      rank: 1,
      key: "MON",
      start: "10:00",
      end: "11:00",
      availableCount: 2,
      allAvailable: true,
    });
  });

  it("칸은 [시작, 종료)라 12:00에 끝나는 가능 시간과 12:00 시작 회의는 겹치지 않는다", () => {
    const shape = recurringShape();
    const candidates = compute(shape, [
      [{ key: "MON", start: "11:00", end: "12:00" }],
      [{ key: "MON", start: "12:00", end: "13:00" }],
    ]);
    expect(candidates.every((c) => c.availableCount === 1)).toBe(true);
  });

  it("가능 인원이 많은 순 → 빠른 열 → 빠른 시작으로 정렬한다", () => {
    const shape = recurringShape();
    const candidates = compute(shape, [
      [
        { key: "MON", start: "09:00", end: "10:00" },
        { key: "TUE", start: "14:00", end: "15:00" },
      ],
      [
        { key: "TUE", start: "14:00", end: "15:00" },
        { key: "TUE", start: "16:00", end: "17:00" },
      ],
    ]);
    expect(candidates.map((c) => [c.key, c.start, c.availableCount])).toEqual([
      ["TUE", "14:00", 2],
      ["MON", "09:00", 1],
      ["TUE", "16:00", 1],
    ]);
    expect(candidates[0].allAvailable).toBe(true);
    expect(candidates[1].allAvailable).toBe(false);
  });

  it("전원 가능 시간이 없으면 가능 인원이 가장 많은 후보를 보여 준다", () => {
    const shape = recurringShape();
    const candidates = compute(shape, [
      [{ key: "MON", start: "09:00", end: "11:00" }],
      [{ key: "MON", start: "09:00", end: "11:00" }],
      [{ key: "TUE", start: "09:00", end: "11:00" }],
    ]);
    expect(candidates[0]).toMatchObject({
      key: "MON",
      availableCount: 2,
      availableMask: 0b011,
      allAvailable: false,
    });
  });

  it("2시간+는 같은 조합의 최대 연속 구간을 인원 → 길이 순으로 고른다", () => {
    const shape = recurringShape();
    const candidates = compute(
      shape,
      [
        [
          { key: "MON", start: "10:00", end: "14:00" },
          { key: "TUE", start: "09:00", end: "12:00" },
        ],
        [
          { key: "MON", start: "10:00", end: "12:30" },
          { key: "TUE", start: "09:00", end: "12:00" },
        ],
      ],
      "AT_LEAST",
      120,
    );
    expect(
      candidates.map((c) => [c.key, c.start, c.end, c.availableCount]),
    ).toEqual([
      ["TUE", "09:00", "12:00", 2],
      ["MON", "10:00", "12:30", 2],
      ["MON", "10:00", "14:00", 1],
    ]);
  });

  it("2시간+는 2시간 미만 구간을 버린다", () => {
    const shape = recurringShape();
    const candidates = compute(
      shape,
      [
        [{ key: "MON", start: "10:00", end: "11:30" }],
        [{ key: "MON", start: "10:00", end: "11:30" }],
      ],
      "AT_LEAST",
      120,
    );
    expect(candidates).toEqual([]);
  });
});
