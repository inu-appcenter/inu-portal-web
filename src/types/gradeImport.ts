import type { Term } from "@/types/timetables";

/**
 * 스마트캠퍼스(학교 ERP) "과목별 성적" 표를 복사해 붙여넣은 텍스트에서 뽑아낸 한 행.
 * 서버 Course와 아직 매칭되기 전 상태다.
 */
export interface ParsedGradeRow {
  /** 교과목명. "CAPSTONE DESIGN", "캡스톤디자인(1)"처럼 공백·괄호를 포함할 수 있다. */
  title: string;
  /** 과목코드(= 학수번호). 숫자형("0005103")과 영문 접두형("IAA6018", "O810301")이 섞여 있다. */
  courseCode: string;
  /** 학점. 표를 과목명까지만 잘라 복사하면 비어 있을 수 있다. */
  credit: number | null;
  /** 등급. 아직 성적이 안 나온 학기는 비어 있을 수 있어 null 허용. */
  grade: string | null;
  /** 이수구분 (기초교양 / 심화교양 / 전공핵심 / 전공심화 …) */
  isuName: string | null;
  /** 이수영역 (학문의기초 / 사회 / 예술체육 / 전공핵심 …) */
  isuFldName: string | null;
  /** 비고 ("재수강성적취소" 등). 없으면 null. */
  note: string | null;
  /**
   * 재수강으로 성적이 취소된 행. 이 과목의 등급·학점은 평점에도 취득학점에도
   * 들어가면 안 된다(같은 과목의 재수강 행이 따로 존재한다).
   */
  voided: boolean;
}

/** 붙여넣은 텍스트 전체를 파싱한 결과. */
export interface ParsedGradeSheet {
  rows: ParsedGradeRow[];
  /** "2026년 1학기 과목별 성적" 같은 제목 줄에서 감지한 학기. 없으면 null. */
  detectedSemester: { year: number; term: Term } | null;
  /** 과목 행으로 해석하지 못하고 건너뛴 줄(학기 제목 제외). */
  skippedLines: string[];
}

export type GradeMatchStatus =
  /** 개설강의의 학수번호가 정확히 일치 - 가장 확실 */
  | "MATCHED_BY_CODE"
  /** 과목명(+학과·이수구분·학점)으로 후보를 하나로 좁힘 */
  | "MATCHED_BY_TITLE"
  /** 같은 이름의 Course가 여럿인데 더 좁히지 못함 */
  | "AMBIGUOUS"
  /** 해당하는 Course를 찾지 못함 */
  | "UNMATCHED";

/** 과목코드/과목명을 서버 Course와 매칭한 결과. */
export interface ResolvedGradeRow extends ParsedGradeRow {
  /** 매칭된 Course PK. 못 찾거나 모호하면 null. */
  courseId: number | null;
  /** 서버 기준 이수구분. 매칭 실패 시 붙여넣은 값을 그대로 둔다. */
  resolvedIsuName: string | null;
  /** 서버 기준 학점. 매칭 실패 시 붙여넣은 값을 그대로 둔다. */
  resolvedCredit: number | null;
  matchStatus: GradeMatchStatus;
}
