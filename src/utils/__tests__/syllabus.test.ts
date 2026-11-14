import { describe, expect, it } from "vitest";
import { ROUTES } from "../../constants/routes";
import { buildSyllabusPath, parseSyllabusOfferingId } from "../syllabus";

describe("buildSyllabusPath", () => {
  it("id, name, professor를 쿼리 파라미터로 포함한 경로를 생성한다", () => {
    const path = buildSyllabusPath({
      courseOfferingId: 12345,
      courseName: "자료구조",
      professor: "홍길동",
    });

    const url = new URL(path, "https://example.com");
    expect(url.pathname).toBe(ROUTES.TIMETABLE.SYLLABUS);
    expect(url.searchParams.get("id")).toBe("12345");
    expect(url.searchParams.get("name")).toBe("자료구조");
    expect(url.searchParams.get("professor")).toBe("홍길동");
  });

  it("professor가 '-'이거나 비어 있으면 professor 파라미터를 생략한다", () => {
    const withDash = new URL(
      buildSyllabusPath({
        courseOfferingId: 42,
        courseName: "운영체제",
        professor: "-",
      }),
      "https://example.com",
    );
    expect(withDash.searchParams.has("professor")).toBe(false);

    const withEmpty = new URL(
      buildSyllabusPath({
        courseOfferingId: 42,
        courseName: "운영체제",
        professor: "   ",
      }),
      "https://example.com",
    );
    expect(withEmpty.searchParams.has("professor")).toBe(false);
  });

  it("특수문자가 포함된 강의명과 교수명을 안전하게 인코딩한다", () => {
    const path = buildSyllabusPath({
      courseOfferingId: 99,
      courseName: "C++ & 알고리즘",
      professor: "김철수/이영희",
    });

    const url = new URL(path, "https://example.com");
    expect(url.searchParams.get("name")).toBe("C++ & 알고리즘");
    expect(url.searchParams.get("professor")).toBe("김철수/이영희");
  });
});

describe("parseSyllabusOfferingId", () => {
  it("location.state의 courseOfferingId를 우선 사용한다", () => {
    expect(parseSyllabusOfferingId(100, "200")).toBe(100);
  });

  it("state가 없으면 쿼리 파라미터의 숫자 ID를 파싱한다", () => {
    expect(parseSyllabusOfferingId(undefined, "200")).toBe(200);
  });

  it("비정상적인 쿼리 파라미터 값이면 undefined를 반환한다", () => {
    expect(parseSyllabusOfferingId(undefined, null)).toBeUndefined();
    expect(parseSyllabusOfferingId(undefined, "")).toBeUndefined();
    expect(parseSyllabusOfferingId(undefined, "   ")).toBeUndefined();
    expect(parseSyllabusOfferingId(undefined, "abc")).toBeUndefined();
    expect(parseSyllabusOfferingId(undefined, "0")).toBeUndefined();
    expect(parseSyllabusOfferingId(undefined, "-5")).toBeUndefined();
  });
});
