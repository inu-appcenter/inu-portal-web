import { describe, expect, it } from "vitest";
import {
  formatSemester,
  formatSemesterShort,
  formatSemesterShortLines,
  isRegularTerm,
  pickCurrentSemester,
  pickLatestOpenSemester,
} from "../semester";
import type { Semester } from "@/types/semesters";

describe("formatSemesterShortLines", () => {
  it("연도를 두 자리로 줄이고 학기를 아랫줄로 내린다", () => {
    expect(formatSemesterShortLines(2023, "FIRST")).toEqual(["23년", "1학기"]);
    expect(formatSemesterShortLines(2023, "SECOND")).toEqual(["23년", "2학기"]);
  });

  it("계절학기는 '학기'를 떼서 더 짧게 쓴다", () => {
    // 그래프 x축에서 "여름학기"는 옆 라벨과 겹칠 만큼 넓다.
    expect(formatSemesterShortLines(2024, "SUMMER")).toEqual(["24년", "여름"]);
    expect(formatSemesterShortLines(2024, "WINTER")).toEqual(["24년", "겨울"]);
  });

  it("x축 라벨은 두 줄을 개행으로 이어 붙인다", () => {
    expect(formatSemesterShort(2022, "FIRST")).toBe("22년\n1학기");
  });

  it("긴 표기는 그대로 둔다", () => {
    expect(formatSemester(2023, "SUMMER")).toBe("2023년 여름학기");
  });
});

describe("pickCurrentSemester & pickLatestOpenSemester", () => {
  const summerActive: Semester = {
    id: 1,
    year: 2026,
    term: "SUMMER",
    status: "OPEN",
    startDate: "2026-06-22",
    endDate: "2026-07-12",
  };
  const secondUpcomingOpen: Semester = {
    id: 2,
    year: 2026,
    term: "SECOND",
    status: "OPEN",
    startDate: "2026-09-01",
    endDate: "2026-12-21",
  };
  const firstClosed: Semester = {
    id: 3,
    year: 2026,
    term: "FIRST",
    status: "CLOSED",
    startDate: "2026-03-02",
    endDate: "2026-06-21",
  };

  it("신버전 서버 응답(isCurrent=true)이 있으면 해당 학기를 최우선으로 선택한다", () => {
    const semesters: Semester[] = [
      { ...secondUpcomingOpen, isCurrent: false },
      { ...summerActive, isCurrent: true },
      { ...firstClosed, isCurrent: false },
    ];
    expect(pickCurrentSemester(semesters, "2026-07-01")?.id).toBe(1);
    expect(pickLatestOpenSemester(semesters)?.id).toBe(2);
  });

  it("구버전 서버 응답(isCurrent 없음)에서도 startDate~endDate로 진행 중 학기를 찾는다", () => {
    const semesters: Semester[] = [
      secondUpcomingOpen,
      summerActive,
      firstClosed,
    ];
    expect(pickCurrentSemester(semesters, "2026-07-01")?.id).toBe(1);
  });

  it("방학 등 진행 중인 학기가 없으면 최신 OPEN 학기로 폴백한다", () => {
    const semesters: Semester[] = [secondUpcomingOpen, firstClosed];
    expect(pickCurrentSemester(semesters, "2026-08-01")?.id).toBe(2);
  });

  it("isRegularTerm은 정규학기(FIRST, SECOND)만 true를 반환한다", () => {
    expect(isRegularTerm("FIRST")).toBe(true);
    expect(isRegularTerm("SECOND")).toBe(true);
    expect(isRegularTerm("SUMMER")).toBe(false);
    expect(isRegularTerm("WINTER")).toBe(false);
  });
});
