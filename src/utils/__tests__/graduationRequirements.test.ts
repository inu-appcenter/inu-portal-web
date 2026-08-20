import { describe, expect, it } from "vitest";
import {
  calculateRequiredAverageGpa,
  evaluateGraduation,
  isGraduationRequirementSupported,
  isSwRequirementExempt,
  parseEntryYearFromStudentId,
  resolveGraduationRule,
} from "../graduationRequirements";
import type { EvaluatedSubject } from "../../types/graduation";

const subject = (
  name: string,
  credits: number,
  options: Partial<EvaluatedSubject> = {},
): EvaluatedSubject => ({
  name,
  credits,
  isMajor: false,
  passed: true,
  ...options,
});

describe("resolveGraduationRule", () => {
  it("학번 구간에 맞는 규정을 찾는다", () => {
    const resolved = resolveGraduationRule("COMPUTER_ENGINEERING", 2023);

    expect(resolved?.exact).toBe(true);
    expect(resolved?.rule.generalRequirements.minTotalCredits).toBe(130);
    expect(resolved?.rule.majorRequirements.minMajorCredits).toBe(72);
    expect(resolved?.rule.majorRequirements.minRequiredMajorCredits).toBe(19);
  });

  it("같은 학과라도 학번이 다르면 다른 규정이 나온다", () => {
    const older = resolveGraduationRule("COMPUTER_ENGINEERING", 2018);

    expect(older?.exact).toBe(true);
    expect(older?.rule.generalRequirements.minTotalCredits).toBe(140);
  });

  it("최신 규정만 수집된 학과는 가장 가까운 규정으로 대체하고 알린다", () => {
    const resolved = resolveGraduationRule("PUBLIC_ADMINISTRATION", 2019);

    expect(resolved?.exact).toBe(false);
    expect(resolved?.rule.startYear).toBe(2023);
  });

  it("학과나 학번이 없으면 판정하지 않는다", () => {
    expect(resolveGraduationRule("", 2023)).toBeNull();
    expect(resolveGraduationRule("COMPUTER_ENGINEERING", null)).toBeNull();
    expect(resolveGraduationRule("NOT_A_DEPARTMENT", 2023)).toBeNull();
  });

  it("navBarList 학과 코드를 그대로 쓴다", () => {
    expect(isGraduationRequirementSupported("COMPUTER_ENGINEERING")).toBe(true);
    // 수집 JSON 쪽 코드는 쓰지 않는다.
    expect(isGraduationRequirementSupported("COMPUTER_SCIENCE")).toBe(false);
  });
});

describe("parseEntryYearFromStudentId", () => {
  it("학번 앞 4자리를 입학연도로 읽는다", () => {
    expect(parseEntryYearFromStudentId("202301234")).toBe(2023);
    expect(parseEntryYearFromStudentId(" 201912345 ")).toBe(2019);
  });

  it("형식이 다르거나 말이 안 되는 연도는 읽지 않는다", () => {
    expect(parseEntryYearFromStudentId("")).toBeNull();
    expect(parseEntryYearFromStudentId(null)).toBeNull();
    expect(parseEntryYearFromStudentId("abc12345")).toBeNull();
    expect(parseEntryYearFromStudentId("197801234")).toBeNull(); // 개교 전
    expect(parseEntryYearFromStudentId("299901234")).toBeNull(); // 미래
  });
});

describe("evaluateGraduation", () => {
  const rule = resolveGraduationRule("COMPUTER_ENGINEERING", 2023)!.rule;

  it("전공/교양/총학점 부족분을 낸다", () => {
    const evaluation = evaluateGraduation(rule, [
      subject("자료구조", 3, { isMajor: true }),
      subject("운영체제", 3, { isMajor: true }),
      subject("문학과테마기행", 3),
      // F 학점 등 미취득 과목은 어디에도 안 들어간다.
      subject("알고리즘", 3, { isMajor: true, passed: false }),
    ]);

    const byKey = Object.fromEntries(
      evaluation.credits.map((item) => [item.key, item]),
    );

    expect(byKey.total.earned).toBe(9);
    expect(byKey.total.required).toBe(130);
    expect(byKey.major.earned).toBe(6);
    expect(byKey.general.earned).toBe(3);
    expect(evaluation.remainingTotalCredits).toBe(121);
    expect(byKey.major.satisfied).toBe(false);
  });

  it("이수한 필수 교양은 이수 처리하고 나머지는 미이수로 남긴다", () => {
    const evaluation = evaluateGraduation(rule, [
      subject("글쓰기이론과실제", 2),
      subject("Academic English 1", 2),
    ]);

    const statuses = Object.fromEntries(
      evaluation.requiredCourses.map((course) => [
        course.courseName,
        course.status,
      ]),
    );

    expect(statuses["글쓰기이론과실제"]).toBe("DONE");
    expect(statuses["Academic English"]).toBe("DONE");
    expect(statuses["대학영어회화"]).toBe("MISSING");
    expect(statuses["컴퓨팅적사고와 SW"]).toBe("MISSING");
    expect(statuses["대학수학"]).toBe("MISSING");
  });

  it("학점이 모자란 필수 교양은 부분이수로 남긴다", () => {
    const evaluation = evaluateGraduation(rule, [subject("대학수학1", 3)]);
    const math = evaluation.requiredCourses.find(
      (course) => course.category === "수학",
    );

    expect(math?.status).toBe("PARTIAL");
    expect(math?.earnedCredits).toBe(3);
    expect(math?.requiredCredits).toBe(6);
  });

  it("전공 과목은 교양 필수 요건을 채우지 않는다", () => {
    const evaluation = evaluateGraduation(rule, [
      subject("멀티미디어프로그래밍", 3, { isMajor: true }),
    ]);
    const sw = evaluation.requiredCourses.find(
      (course) => course.category === "SW",
    );

    expect(sw?.status).toBe("MISSING");
  });

  it("전공필수로 대체되는 요건은 전공 과목으로도 채워진다", () => {
    // 기계공학과 SW 요건은 "SW(=전공필수 기계기초프로그래밍)"으로 적혀 있다.
    const mechanical = resolveGraduationRule("MECHANICAL_ENGINEERING", 2023)!;
    const evaluation = evaluateGraduation(mechanical.rule, [
      subject("기계기초프로그래밍", 2, { isMajor: true }),
    ]);
    const sw = evaluation.requiredCourses.find(
      (course) => course.category === "SW",
    );

    expect(sw?.status).toBe("DONE");
  });

  it("전공필수 학점은 현행 이수구분인 전공기초·전공핵심으로 센다", () => {
    // 인천대는 2022년에 전공필수/전공선택 → 전공기초·전공핵심/전공심화로 바꿨다.
    const withIsuName = evaluateGraduation(rule, [
      subject("컴퓨터공학입문", 3, { isMajor: true, isuName: "전공기초" }),
      subject("자료구조", 3, { isMajor: true, isuName: "전공핵심" }),
      subject("인공지능개론", 3, { isMajor: true, isuName: "전공심화" }),
    ]);
    const requiredMajor = withIsuName.credits.find(
      (item) => item.key === "requiredMajor",
    );

    expect(requiredMajor?.earned).toBe(6);
    expect(requiredMajor?.unverifiable).toBeUndefined();
    // 전공 전체 학점에는 전공심화까지 다 들어간다.
    expect(
      withIsuName.credits.find((item) => item.key === "major")?.earned,
    ).toBe(9);

    const withoutIsuName = evaluateGraduation(rule, [
      subject("자료구조", 3, { isMajor: true }),
    ]);

    expect(
      withoutIsuName.credits.find((item) => item.key === "requiredMajor")
        ?.unverifiable,
    ).toBe(true);
  });

  it("옛 성적표의 전공필수 표기도 그대로 센다", () => {
    const evaluation = evaluateGraduation(rule, [
      subject("컴퓨터공학입문", 3, { isMajor: true, isuName: "전공필수" }),
    ]);

    expect(
      evaluation.credits.find((item) => item.key === "requiredMajor")?.earned,
    ).toBe(3);
  });

  it("핵심교양은 학점이 아니라 이수영역 수로 센다", () => {
    const evaluation = evaluateGraduation(rule, [
      subject("서양철학의이해", 3, {
        isuName: "핵심교양",
        isuFldName: "(핵심)인문",
      }),
      subject("논리와사고", 3, {
        isuName: "핵심교양",
        isuFldName: "(핵심)인문",
      }),
      subject("사회학개론", 3, {
        isuName: "핵심교양",
        isuFldName: "(핵심)사회",
      }),
      // 이수영역이 비어 있는 행("-")은 셀 수 없다.
      subject("스포츠와건강", 1, { isuName: "기초교양", isuFldName: "-" }),
    ]);

    expect(evaluation.coreGeneral?.required).toBe(3);
    expect(evaluation.coreGeneral?.areas).toEqual(["(핵심)인문", "(핵심)사회"]);
    expect(evaluation.coreGeneral?.satisfied).toBe(false);
    expect(evaluation.coreGeneral?.unverifiable).toBe(false);
  });

  it("이수영역 정보가 없으면 핵심교양은 판정하지 않고 안내만 한다", () => {
    const evaluation = evaluateGraduation(rule, [subject("서양철학의이해", 3)]);

    expect(evaluation.coreGeneral?.unverifiable).toBe(true);
    expect(
      evaluation.notices.some((notice) => notice.includes("핵심교양")),
    ).toBe(true);
  });

  it("교양 상한을 넘으면 초과분을 알린다", () => {
    const evaluation = evaluateGraduation(rule, [
      subject("교양 몰아듣기", 60, { isuName: "심화교양" }),
    ]);

    expect(evaluation.generalOverflow).toBe(5); // 상한 55학점
    expect(
      evaluation.notices.some((notice) => notice.includes("교양 상한")),
    ).toBe(true);
  });

  it("상한이 없는 학번대는 초과분을 잡지 않는다", () => {
    const oldRule = resolveGraduationRule("COMPUTER_ENGINEERING", 2000)!.rule;
    const evaluation = evaluateGraduation(oldRule, [
      subject("교양 몰아듣기", 90),
    ]);

    expect(evaluation.generalOverflow).toBe(0);
  });
});

describe("calculateRequiredAverageGpa", () => {
  it("남은 학점에서 필요한 평균 평점을 낸다", () => {
    const needed = calculateRequiredAverageGpa({
      targetGpa: 4.0,
      gpaCredits: 60,
      gpaPoints: 60 * 3.5,
      remainingCredits: 60,
    });

    expect(needed).toBeCloseTo(4.5, 5);
  });

  it("목표가 이미 넘은 상태면 필요 평점이 낮게 나온다", () => {
    const needed = calculateRequiredAverageGpa({
      targetGpa: 3.0,
      gpaCredits: 60,
      gpaPoints: 60 * 4.0,
      remainingCredits: 60,
    });

    expect(needed).toBeCloseTo(2.0, 5);
  });

  it("남은 학점이 없으면 계산하지 않는다", () => {
    expect(
      calculateRequiredAverageGpa({
        targetGpa: 4.0,
        gpaCredits: 130,
        gpaPoints: 130 * 4.0,
        remainingCredits: 0,
      }),
    ).toBeNull();
  });
});

describe("SW 필수 교양 면제 (정보기술대학)", () => {
  const rule = resolveGraduationRule("COMPUTER_ENGINEERING", 2023)!.rule;
  const findSw = (evaluation: ReturnType<typeof evaluateGraduation>) =>
    evaluation.requiredCourses.find((course) => course.category === "SW");

  it("정보기술대학 학과는 SW 요건을 면제로 본다", () => {
    expect(isSwRequirementExempt("COMPUTER_ENGINEERING")).toBe(true);
    expect(isSwRequirementExempt("INFORMATION_COMMUNICATION_ENGINEERING")).toBe(
      true,
    );
    expect(isSwRequirementExempt("EMBEDDED_SYSTEM")).toBe(true);
  });

  it("다른 단과대 학과와 빈 코드는 면제가 아니다", () => {
    expect(isSwRequirementExempt("MECHANICAL_ENGINEERING")).toBe(false);
    expect(isSwRequirementExempt("BUSINESS_ADMINISTRATION")).toBe(false);
    expect(isSwRequirementExempt("")).toBe(false);
    expect(isSwRequirementExempt(null)).toBe(false);
  });

  it("SW 과목을 안 들었어도 미이수로 잡지 않는다", () => {
    const evaluation = evaluateGraduation(
      rule,
      [subject("자료구조", 3, { isMajor: true })],
      "COMPUTER_ENGINEERING",
    );

    expect(findSw(evaluation)?.status).toBe("EXEMPT");
    expect(evaluation.notices).toContain(
      "정보기술대학은 SW 교과가 전공에 들어 있어 SW 필수 교양은 면제로 봤어요.",
    );
  });

  it("면제 학과는 SW 교양을 이미 들었어도 면제로 표시한다", () => {
    const evaluation = evaluateGraduation(
      rule,
      [subject("컴퓨팅적사고와SW", 2)],
      "COMPUTER_ENGINEERING",
    );

    const sw = findSw(evaluation);
    expect(sw?.status).toBe("EXEMPT");
    expect(sw?.earnedCredits).toBe(0);
    expect(sw?.matchedNames).toEqual([]);
  });

  it("면제 학과가 아니면 SW 요건을 그대로 판정한다", () => {
    const mechanical = resolveGraduationRule("MECHANICAL_ENGINEERING", 2023)!;
    const evaluation = evaluateGraduation(
      mechanical.rule,
      [subject("기계기초프로그래밍", 3, { isMajor: true })],
      mechanical.departmentCode,
    );

    // 기계공학과는 SW 요건이 전공필수 과목으로 대체되는 형태라 그대로 판정한다.
    expect(findSw(evaluation)?.status).toBe("DONE");
  });

  it("학과 코드를 안 넘기면 학칙 그대로 본다", () => {
    const evaluation = evaluateGraduation(rule, [
      subject("자료구조", 3, { isMajor: true }),
    ]);

    expect(findSw(evaluation)?.status).toBe("MISSING");
  });
});
