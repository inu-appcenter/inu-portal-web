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
}

/** PUT /api/grades 요청 바디의 records[] 항목 하나. */
export interface GradeRecordRequest {
  courseCode?: string;
  title: string;
  credit: number;
  grade: GradeLetter | null;
  isMajor: boolean;
  isCourseRepetition: boolean;
}

/** PUT /api/grades 요청 바디. 같은 year/term의 기존 성적을 전부 지우고 교체한다. */
export interface GradeRecordSaveRequest {
  year: number;
  term: Term;
  records: GradeRecordRequest[];
}
