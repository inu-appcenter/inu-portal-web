import { describe, it, expect } from "vitest";
import { toSanitizedAcademicDisplay } from "../../apis/mobileAgentBridge";

describe("toSanitizedAcademicDisplay", () => {
  it("rawFields 및 민감한 저수준 프로토콜 파편을 배제하고 UI 카드에 필요한 필드만 정제한다", () => {
    const rawData = {
      studentId: "202001234",
      koreanName: "김인천",
      departmentName: "컴퓨터공학부",
      collegeName: "정보기술대학",
      enrollmentStatus: "재학",
      acquiredCredits: "105",
      gradeAverage: "4.12",
      advisorProfessorName: "박문주",
      completedSemesterCount: "6",
      birthDate: "2001-01-01",
      mobilePhone: "010-1234-5678",
      rawFields: {
        stuno: "202001234",
        korNm: "김인천",
        handpNo: "010-1234-5678",
        birthDt: "2001-01-01",
        resNoMasked: "010101-1******",
        secretInternalToken: "WMONID_9999",
      },
    };

    const sanitized = toSanitizedAcademicDisplay(rawData);

    expect(sanitized).toBeDefined();
    expect(sanitized).toEqual({
      studentId: "202001234",
      koreanName: "김인천",
      departmentName: "컴퓨터공학부",
      collegeName: "정보기술대학",
      enrollmentStatus: "재학",
      acquiredCredits: "105",
      gradeAverage: "4.12",
      advisorProfessorName: "박문주",
      completedSemesterCount: "6",
    });

    // 민감 정보 누수 차단 확인
    expect((sanitized as any).rawFields).toBeUndefined();
    expect((sanitized as any).mobilePhone).toBeUndefined();
    expect((sanitized as any).birthDate).toBeUndefined();
    expect((sanitized as any).resNoMasked).toBeUndefined();
  });

  it("데이터가 비어있거나 rawFields만 존재할 때도 안전하게 fallback 값을 추출한다", () => {
    const rawData = {
      rawFields: {
        stuno: "202105678",
        korNm: "이횃불",
        deptNm: "임베디드시스템공학과",
        acqHp: "64",
        mrksAvg: "3.85",
        mrksCptnTmCnt: "4",
      },
    };

    const sanitized = toSanitizedAcademicDisplay(rawData);

    expect(sanitized).toBeDefined();
    expect(sanitized?.studentId).toBe("202105678");
    expect(sanitized?.koreanName).toBe("이횃불");
    expect(sanitized?.departmentName).toBe("임베디드시스템공학과");
    expect(sanitized?.acquiredCredits).toBe("64");
    expect(sanitized?.gradeAverage).toBe("3.85");
    expect(sanitized?.completedSemesterCount).toBe("4");
    expect((sanitized as any).rawFields).toBeUndefined();
  });

  it("undefined 전달 시 undefined를 안전하게 반환한다", () => {
    expect(toSanitizedAcademicDisplay(undefined)).toBeUndefined();
  });
});
