import type { Term } from "@/types/timetables";

/**
 * 성적 등급. 서버 응답의 `grade_value`, 요청 바디의 `grade`가 공통으로 쓰는 표기.
 * (서버 응답의 `grade` 필드는 "B_PLUS" 같은 내부 enum 이름이라 화면에는 안 쓴다.)
 */
export type GradeLetter =
  | "A+"
  | "A0"
  | "B+"
  | "B0"
  | "C+"
  | "C0"
  | "D+"
  | "D0"
  | "F"
  | "P"
  | "NP";

/** GET /api/grades, /api/grades/all, PUT 계열 응답에 담기는 성적 레코드 1건. */
export interface GradeRecord {
  id: number;
  year: number;
  term: Term;
  courseCode: string | null;
  title: string;
  credit: number;
  /** 서버 내부 enum 이름(예: "B_PLUS"). 화면 표시에는 grade_value를 쓴다. */
  grade: string | null;
  /** 화면 표기와 동일한 등급 문자열(예: "B+"). 성적 미발표 과목은 null. */
  grade_value: GradeLetter | null;
  isMajor: boolean;
  /** 재수강으로 성적이 취소된 과목이면 true. */
  isCourseRepetition: boolean;
  /**
   * 이수구분(전공기초/전공핵심/심화교양…) 원문. 졸업요건 판정에 쓰인다.
   * 서버가 아직 배포 전이면 응답에 없을 수 있어 optional로 둔다.
   */
  isuName?: string | null;
  /** 이수영역(전공심화/사회…) 원문. */
  isuFldName?: string | null;
}

/** PUT /api/grades 요청 바디의 records[] 항목 하나. */
export interface GradeRecordRequest {
  courseCode?: string;
  title: string;
  credit: number;
  grade: GradeLetter | null;
  isMajor: boolean;
  isCourseRepetition: boolean;
  /**
   * 이수구분/이수영역 원문. 서버가 아직 이 필드를 받지 않는 버전이어도 그냥
   * 무시되도록 optional로 보낸다(구버전 서버와의 호환).
   */
  isuName?: string | null;
  isuFldName?: string | null;
}

/** PUT /api/grades 요청 바디. 같은 year/term의 기존 성적을 전부 지우고 교체한다. */
export interface GradeRecordSaveRequest {
  year: number;
  term: Term;
  records: GradeRecordRequest[];
}
