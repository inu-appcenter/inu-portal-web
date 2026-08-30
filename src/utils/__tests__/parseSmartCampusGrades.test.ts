import { describe, expect, it } from "vitest";
import { parseSmartCampusGrades } from "../parseSmartCampusGrades";

/**
 * 안드로이드 스마트캠퍼스 앱에서 "모두 선택"으로 화면 하나를 통째로 복사한 텍스트.
 * 상단 메뉴, 전체 성적 요약, 학기별 성적 표까지 전부 딸려온다.
 */
const FULL_SCREEN = [
  "인천대학교 신분증  알림",
  "성적",
  "취득성적",
  "확정전성적",
  "전체성적",
  "신청학점\t취득학점\t학기평점",
  "103\t103\t3.47",
  "학기성적",
  "년도\t학기\t신청\t취득\t학기평점\t석차/총원\t이수포기",
  "2026\t1학기\t18\t18\t3.65\t59/116\t",
  "2025\t2학기\t11\t11\t3.55\t82/110\t",
  "2025\t여름계절학기\t6\t6\t3.75\t0/0\t",
  "2023\t2학기\t13\t13\t3.10\t83/111\t",
  "2023\t1학기\t19\t19\t3.42\t61/118\t",
  "2022\t2학기\t17\t17\t3.32\t60/116\t",
  "2022\t1학기\t19\t19\t3.58\t35/121\t",
  "2022년 1학기 과목별 성적",
  "교과목명/과목코드\t학점\t등급\t이수구분\t이수영역\t성적폐기사유",
  "디지털기술과미래 / 0004325\t3\tB+\t교양필수\tINU핵심창의융합\t",
  "현대사회와빅데이터 / 0006433\t3\tB+\t교양필수\tINU핵심문제해결\t",
  "Academic English / 0009316\t2\tA+\t교양필수\t기초교양\t",
  "대학수학(1) / XAA1358\t3\tA0\t교양필수\t기초교양\t",
  "컴퓨터공학개론 / 0001762\t2\tA0\t전공기초\t전공기초\t",
  "프로그래밍입문 / 0003426\t3\tB+\t전공기초\t전공기초\t",
  "이산수학 / IA02009\t3\tC+\t전공기초\t전공기초\t",
].join("\n");

describe("parseSmartCampusGrades", () => {
  it("화면 전체를 복사해도 과목 행만 골라낸다", () => {
    const result = parseSmartCampusGrades(FULL_SCREEN);

    expect(result.rows.map((row) => row.title)).toEqual([
      "디지털기술과미래",
      "현대사회와빅데이터",
      "Academic English",
      "대학수학(1)",
      "컴퓨터공학개론",
      "프로그래밍입문",
      "이산수학",
    ]);
    expect(result.rows[0]).toMatchObject({
      courseCode: "0004325",
      credit: 3,
      grade: "B+",
      isuName: "교양필수",
      isuFldName: "INU핵심창의융합",
      note: null,
      voided: false,
    });
  });

  it("학기별 요약 표의 석차 칸(59/116)을 과목으로 오인하지 않는다", () => {
    const result = parseSmartCampusGrades(FULL_SCREEN);
    expect(
      result.rows.some((row) => ["116", "121", "110"].includes(row.courseCode)),
    ).toBe(false);
  });

  it("요약 표가 아니라 과목 표 제목에서 학기를 읽는다", () => {
    const result = parseSmartCampusGrades(FULL_SCREEN);
    expect(result.detectedSemester).toEqual({ year: 2022, term: "FIRST" });
  });

  it("표 중간부터 드래그해 앞뒤가 잘려도 온전한 행은 모두 읽는다", () => {
    // iOS: 첫 줄은 행 중간에서 시작해 과목명이 없고, 마지막 줄은 학점까지만 왔다.
    const partial = [
      "0004325\t3\tB+\t교양필수\tINU핵심창의융합",
      "현대사회와빅데이터 / 0006433\t3\tB+\t교양필수\tINU핵심문제해결",
      "Academic English / 0009316\t2\tA+\t교양필수\t기초교양",
      "이산수학 / IA02009\t3",
    ].join("\n");

    const result = parseSmartCampusGrades(partial);

    expect(result.rows.map((row) => row.title)).toEqual([
      "현대사회와빅데이터",
      "Academic English",
      "이산수학",
    ]);
    expect(result.rows[2]).toMatchObject({ credit: 3, grade: null });
    expect(result.detectedSemester).toBeNull();
  });

  it("탭 없이 공백으로만 붙여넣어도 읽는다", () => {
    const result = parseSmartCampusGrades(
      "Academic English / 0009316 2 A+ 교양필수 기초교양",
    );
    expect(result.rows[0]).toMatchObject({
      title: "Academic English",
      credit: 2,
      grade: "A+",
      isuName: "교양필수",
      isuFldName: "기초교양",
    });
  });

  it("성적폐기사유가 있는 행은 계산에서 빼도록 표시한다", () => {
    const result = parseSmartCampusGrades(
      "이산수학 / IA02009\t3\tC+\t전공기초\t전공기초\t재수강성적취소",
    );
    expect(result.rows[0]).toMatchObject({
      note: "재수강성적취소",
      voided: true,
    });
  });

  it("등급이 아직 없는 학기도 행으로 받는다", () => {
    const result = parseSmartCampusGrades(
      "지능정보시스템 / 0009484\t3\t\t전공심화\t전공심화",
    );
    expect(result.rows[0]).toMatchObject({
      credit: 3,
      grade: null,
      isuName: "전공심화",
      isuFldName: "전공심화",
    });
  });
});
