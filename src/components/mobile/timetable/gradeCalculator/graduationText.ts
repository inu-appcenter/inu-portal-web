import type { GraduationEvaluation } from "@/types/graduation";
import type { ResolvedGraduationRule } from "@/utils/graduationRequirements";

// 졸업요건 요약 카드(메인)와 졸업요건 상세 화면이 같이 쓰는 문구·상수.

/** 졸업요건 변경 제보 구글폼 */
export const REQUIREMENT_REPORT_FORM_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSc1DAOC2N_HVzsMa6JMoSOqckpkX39SkHbrZD_eKTtr2cfKqA/viewform";

export const formatEnglishCertification = (
  certification: NonNullable<GraduationEvaluation["englishCertification"]>,
): string => {
  const parts: string[] = [];
  if (certification.toeic) parts.push(`TOEIC ${certification.toeic}`);
  if (certification.toeicSpeaking)
    parts.push(`TOEIC Speaking ${certification.toeicSpeaking}`);
  if (certification.opic) parts.push(`OPIc ${certification.opic}`);
  return parts.join(" · ");
};

/**
 * 기준 안내 문구. 하나만 띄운다: 다른 학번 기준으로 대체 > C(공통 기준) > B.
 * A(학과 자료에서 학번별 이력까지 확인)는 안내하지 않는다.
 */
export const getRuleNotice = (
  resolved: ResolvedGraduationRule,
  entryYear: number | null,
): { tone: "warn" | "info"; text: string } | null => {
  if (!resolved.exact) {
    const { startYear, endYear } = resolved.rule;
    const range =
      endYear >= 2099 ? `${startYear}학번 이후` : `${startYear}~${endYear}학번`;
    return {
      tone: "warn",
      text: `${entryYear}학번 기준이 없어 가장 가까운 ${range} 기준으로 보여드려요. 다르다면 아래에서 제보해 주세요.`,
    };
  }
  if (resolved.department.confidence === "C") {
    return {
      tone: "info",
      text: "학과 자료가 없어 학교 공통 기준으로 계산했어요. 최종 확인은 학과 사무실에서 해 주세요.",
    };
  }
  if (resolved.department.confidence === "B") {
    return {
      tone: "info",
      text: "학과 홈페이지와 학교 공지로 정리한 기준이에요. 최종 확인은 학과 사무실에서 해 주세요.",
    };
  }
  return null;
};
