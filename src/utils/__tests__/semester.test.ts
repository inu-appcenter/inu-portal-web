import { describe, expect, it } from "vitest";
import {
  formatSemester,
  formatSemesterShort,
  formatSemesterShortLines,
} from "../semester";

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
