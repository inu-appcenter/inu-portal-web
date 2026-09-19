import { describe, expect, it } from "vitest";
import type { ClassItem } from "../../components/mobile/timetable/TimetableGrid";
import {
  ALL_DAILY_BRIEF_CARDS,
  buildAutoDailyBrief,
  type DailyBriefCardType,
} from "../useDailyBriefRanking";

const visibility = Object.fromEntries(
  ALL_DAILY_BRIEF_CARDS.map((card) => [card, true]),
) as Record<DailyBriefCardType, boolean>;

const classItem = (
  name: string,
  startTime: number,
  endTime: number,
): ClassItem => ({
  id: startTime * 100,
  name,
  room: "",
  day: 0,
  startTime,
  endTime,
});

const build = (
  now: Date,
  todayClasses: ClassItem[],
  overrides: Partial<Parameters<typeof buildAutoDailyBrief>[0]> = {},
) =>
  buildAutoDailyBrief({
    now,
    isLoggedIn: true,
    hasTimetableContext: true,
    todayClasses,
    urgentAssignmentCount: 0,
    activeRoutineCards: [],
    visibility,
    focusCard: null,
    ...overrides,
  });

describe("buildAutoDailyBrief", () => {
  it("비 오는 등교 시간에는 관련된 카드를 점수순으로 모두 보여준다", () => {
    const result = build(
      new Date("2026-09-21T08:10:00"),
      [classItem("자료구조", 9, 10.5)],
      { weatherSky: "비", urgentAssignmentCount: 2 },
    );

    expect(result.cards).toEqual(["weather", "lms", "timetable", "bus"]);
    expect(result.title).toBe("오늘은 우산을 챙겨주세요");
  });

  it("점심시간의 긴 현재 공강에는 학식과 도서관만 관련 카드로 올린다", () => {
    const result = build(new Date("2026-09-21T11:30:00"), [
      classItem("글쓰기", 9, 10),
      classItem("영어", 13, 14),
    ]);

    expect(result.cards).toEqual(["cafeteria", "library", "timetable"]);
    expect(result.title).toBe("지금은 점심 먹기 좋은 시간이에요");
    expect(result.subtitle).toContain("90분");
  });

  it("마지막 수업 직후에는 하교와 임박 과제를 우선한다", () => {
    const result = build(
      new Date("2026-09-21T16:00:00"),
      [classItem("운영체제", 14, 15)],
      { urgentAssignmentCount: 1 },
    );

    expect(result.cards).toEqual(["bus", "lms", "library"]);
    expect(result.title).toBe("오늘 수업이 모두 끝났어요");
  });

  it("특별한 상황이 없으면 모든 카드를 채우지 않고 공통 카드 하나만 보여준다", () => {
    const result = build(new Date("2026-09-20T15:00:00"), []);

    expect(result.cards).toEqual(["notice"]);
  });

  it("포커스로 진입한 카드는 숨김 설정과 관계없이 첫 번째에 둔다", () => {
    const result = build(new Date("2026-09-20T15:00:00"), [], {
      visibility: { ...visibility, library: false },
      focusCard: "library",
    });

    expect(result.cards[0]).toBe("library");
  });
});
