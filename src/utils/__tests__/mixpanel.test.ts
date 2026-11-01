import { describe, expect, it } from "vitest";
import { getSignupCohort, getStudentYear } from "../mixpanel";

describe("getStudentYear", () => {
  it("학번 앞 4자리를 입학연도로 쓴다", () => {
    expect(getStudentYear("202412345")).toBe(2024);
  });

  it("숫자로 시작하지 않으면 undefined", () => {
    expect(getStudentYear("abc")).toBeUndefined();
    expect(getStudentYear(null)).toBeUndefined();
    expect(getStudentYear("")).toBeUndefined();
  });
});

describe("getSignupCohort", () => {
  it("월·ISO 주차 코호트를 만든다", () => {
    expect(getSignupCohort("2026-03-02T10:00:00")).toEqual({
      month: "2026-03",
      week: "2026-W10",
    });
  });

  it("연말·연초는 ISO 주차의 연도를 따른다", () => {
    expect(getSignupCohort("2027-01-01T00:00:00")?.week).toBe("2026-W53");
    expect(getSignupCohort("2024-12-30")?.week).toBe("2025-W01");
  });

  it("값이 없거나 형식이 다르면 undefined", () => {
    expect(getSignupCohort(undefined)).toBeUndefined();
    expect(getSignupCohort("not-a-date")).toBeUndefined();
  });
});
