import { describe, expect, it } from "vitest";
import {
  findDepartmentCodeByName,
  getDepartmentOptionGroups,
} from "../departmentOptions";
import { isGraduationRequirementSupported } from "../graduationRequirements";

describe("findDepartmentCodeByName", () => {
  it("학과명으로 학과 코드를 찾는다", () => {
    expect(findDepartmentCodeByName("컴퓨터공학부")).toBe(
      "COMPUTER_ENGINEERING",
    );
    expect(findDepartmentCodeByName(" 경제학과 ")).toBe("ECONOMICS");
  });

  it("서버 departmentCode(학사 코드)는 학과로 인정하지 않는다", () => {
    // /api/members는 departmentCode로 "0000077" 같은 학사 시스템 코드를 준다.
    expect(findDepartmentCodeByName("0000077")).toBe("");
  });

  it("붙임표·공백·야간 표기가 달라도 찾는다", () => {
    expect(findDepartmentCodeByName("바이오-로봇시스템공학과")).toBe(
      "BIO_ROBOTICS_ENGINEERING",
    );
    expect(findDepartmentCodeByName("경제학과(야)")).toBe("ECONOMICS");
    expect(findDepartmentCodeByName("생명과학부(생명과학전공)")).toBe(
      "LIFE_SCIENCE",
    );
  });

  it("전공 단위로만 내려오는 학사 표기도 대응표로 찾는다", () => {
    expect(findDepartmentCodeByName("분자의생명전공")).toBe(
      "LIFE_SCIENCE_MOLECULAR",
    );
    expect(findDepartmentCodeByName("환경공학전공")).toBe(
      "ENVIRONMENT_ENGINEERING",
    );
    expect(findDepartmentCodeByName("한국화전공")).toBe("FINE_ARTS");
  });

  it("학과를 따로 등록하지 않아 Department enum 한글명이 내려와도 찾는다", () => {
    // MemberResponseDto는 schoolDepartment가 없으면 enum의 departmentName을 준다.
    // 그 이름이 navBarList 표기와 다른 두 학과.
    expect(findDepartmentCodeByName("계약학과")).toBe("TECHNO_MANAGEMENT");
    expect(findDepartmentCodeByName("Global Trade & Service 학부")).toBe(
      "TRADE",
    );
  });

  it("모르는 학과명은 빈 문자열", () => {
    expect(findDepartmentCodeByName("")).toBe("");
    expect(findDepartmentCodeByName(null)).toBe("");
    expect(findDepartmentCodeByName("없는학과")).toBe("");
  });

  it("찾은 코드는 졸업요건 데이터가 아는 코드다", () => {
    ["컴퓨터공학부", "경제학과", "한국화전공", "분자의생명전공"].forEach(
      (name) => {
        expect(
          isGraduationRequirementSupported(findDepartmentCodeByName(name)),
        ).toBe(true);
      },
    );
  });
});

describe("getDepartmentOptionGroups", () => {
  it("단과대학별로 학과를 묶어 낸다", () => {
    const groups = getDepartmentOptionGroups();

    expect(groups.length).toBeGreaterThan(10);
    expect(groups.every((group) => group.departments.length > 0)).toBe(true);
    expect(
      groups
        .find((group) => group.college === "정보기술대학")
        ?.departments.map((department) => department.code),
    ).toContain("COMPUTER_ENGINEERING");
  });

  it("모든 학과 코드에 졸업요건 데이터가 있다", () => {
    const missing = getDepartmentOptionGroups()
      .flatMap((group) => group.departments)
      .filter(
        (department) => !isGraduationRequirementSupported(department.code),
      );

    expect(missing).toEqual([]);
  });
});
