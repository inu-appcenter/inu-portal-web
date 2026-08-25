import { describe, expect, it } from "vitest";
import { resolveGreeting, type GreetingInput } from "../greeting";

const at = (hours: number, minutes = 0) =>
  new Date(2026, 7, 20, hours, minutes, 0);

const baseInput = (override: Partial<GreetingInput> = {}): GreetingInput => ({
  nickname: "유니",
  now: at(10),
  hasUnreadNotice: false,
  todayClasses: [],
  hasTimetable: true,
  isReady: true,
  ...override,
});

describe("resolveGreeting", () => {
  it("안 읽은 학사 공지가 있으면 다른 조건보다 우선한다", () => {
    const result = resolveGreeting(
      baseInput({
        hasUnreadNotice: true,
        hasUnreadAcademicNotice: true,
        todayClasses: [{ name: "자료구조", startTime: 10.25, endTime: 12 }],
      }),
    );

    expect(result.kind).toBe("unreadNotice");
    expect(result.lead).toBe("유니님,");
    expect(result.body).toBe("새로운 학사 공지를 확인해보세요");
  });

  it("학사 공지가 아니면 일반 공지 문구를 쓴다", () => {
    const result = resolveGreeting(baseInput({ hasUnreadNotice: true }));

    expect(result.kind).toBe("unreadNotice");
    expect(result.body).not.toContain("학사");
  });

  it("30분 이내 수업은 시작 시각과 과목명을 알려준다", () => {
    const result = resolveGreeting(
      baseInput({
        now: at(8, 40),
        todayClasses: [{ name: "자료구조", startTime: 9, endTime: 10.5 }],
      }),
    );

    expect(result.kind).toBe("upcomingClass");
    expect(result.body).toBe("9시에 자료구조 수업이에요");
  });

  it("과목명이 없으면 남은 시간으로 안내한다", () => {
    const result = resolveGreeting(
      baseInput({
        now: at(9, 30),
        todayClasses: [{ startTime: 10, endTime: 11.5 }],
      }),
    );

    expect(result.body).toBe("30분 뒤 수업이 있어요");
  });

  it("30분보다 더 남은 수업은 임박으로 보지 않는다", () => {
    const result = resolveGreeting(
      baseInput({
        now: at(8),
        todayClasses: [{ name: "자료구조", startTime: 9, endTime: 10.5 }],
      }),
    );

    expect(result.kind).toBe("fallback");
  });

  it("시간표가 있는데 오늘 수업이 없으면 공강 문구를 쓴다", () => {
    const result = resolveGreeting(baseInput({ todayClasses: [] }));

    expect(result.kind).toBe("freeDay");
    expect(result.lead).not.toContain("유니님");
  });

  it("시간표 자체가 없으면 공강으로 단정하지 않는다", () => {
    const result = resolveGreeting(baseInput({ hasTimetable: false }));

    expect(result.kind).toBe("fallback");
  });

  it("오늘 수업이 모두 끝나면 마무리 인사를 한다", () => {
    const result = resolveGreeting(
      baseInput({
        now: at(18),
        todayClasses: [{ name: "자료구조", startTime: 9, endTime: 10.5 }],
      }),
    );

    expect(result.kind).toBe("classesDone");
    expect(result.lead).toBe("유니님,");
  });

  it("데이터가 준비되지 않았으면 fallback 인사말을 쓴다", () => {
    const result = resolveGreeting(baseInput({ isReady: false }));

    expect(result.kind).toBe("fallback");
  });

  it("닉네임이 없으면 기본 닉네임을 쓴다", () => {
    const result = resolveGreeting(
      baseInput({ nickname: null, hasTimetable: false }),
    );

    expect(result.lead).toBe("유니님,");
  });

  it("같은 날에는 문구가 흔들리지 않는다", () => {
    const first = resolveGreeting(baseInput({ hasTimetable: false }));
    const second = resolveGreeting(
      baseInput({ hasTimetable: false, now: at(21, 13) }),
    );

    expect(first.body).toBe(second.body);
  });
});
