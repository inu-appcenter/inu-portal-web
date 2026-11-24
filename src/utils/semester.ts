import type { Term } from "@/types/timetables";
import type { Semester } from "@/types/semesters";

export const TERM_LABELS: Record<Term, string> = {
  FIRST: "1학기",
  SUMMER: "여름학기",
  SECOND: "2학기",
  WINTER: "겨울학기",
};

export const TERM_ORDER: Record<Term, number> = {
  FIRST: 0,
  SUMMER: 1,
  SECOND: 2,
  WINTER: 3,
};

export const formatSemester = (year: number, term: Term) =>
  `${year}년 ${TERM_LABELS[term]}`;

/** 좁은 자리(그래프 x축 등)에 쓰는 짧은 학기 표기 */
export const TERM_SHORT_LABELS: Record<Term, string> = {
  FIRST: "1학기",
  SUMMER: "여름",
  SECOND: "2학기",
  WINTER: "겨울",
};

/**
 * 좁은 자리에서 두 줄로 쓰는 표기. ["22년", "1학기"] / ["24년", "여름"].
 * 연도는 뒤 두 자리만 쓰고, 계절학기는 "학기"를 떼서 폭을 줄인다.
 */
export const formatSemesterShortLines = (
  year: number,
  term: Term,
): [string, string] => [`${String(year).slice(-2)}년`, TERM_SHORT_LABELS[term]];

/** 위 두 줄 표기를 개행 문자로 이어 붙인 값. 그래프 x축 라벨로 쓴다. */
export const formatSemesterShort = (year: number, term: Term) =>
  formatSemesterShortLines(year, term).join("\n");

export const sortSemestersDesc = (semesters: Semester[]) =>
  [...semesters].sort(
    (a, b) => b.year - a.year || TERM_ORDER[b.term] - TERM_ORDER[a.term],
  );

export const getLocalDateIso = (date = new Date()): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const isRegularTerm = (term: Term): boolean =>
  term === "FIRST" || term === "SECOND";

// 현재 수업이 진행 중인 학기를 고른다.
// 1. 신버전 서버의 isCurrent 플래그 우선
// 2. 구버전 서버 호환을 위한 startDate <= today <= endDate 폴백
// 3. 방학 등 공백기에는 OPEN 학기 -> 최신 학기 순으로 폴백
export const pickCurrentSemester = <
  T extends Pick<Semester, "status"> &
    Partial<Pick<Semester, "isCurrent" | "startDate" | "endDate">>,
>(
  semesters: T[],
  today = getLocalDateIso(),
): T | undefined =>
  semesters.find((s) => s.isCurrent === true) ??
  semesters.find(
    (s) =>
      Boolean(s.startDate && s.endDate) &&
      s.startDate! <= today &&
      today <= s.endDate!,
  ) ??
  semesters.find((s) => s.status === "OPEN") ??
  semesters[0];

// 시간표 생성·마법사·포털 가져오기처럼 "가장 최근에 열린 학기"가 기본값이 되어야
// 하는 화면에서 사용한다.
export const pickLatestOpenSemester = <T extends { status: Semester["status"] }>(
  semesters: T[],
): T | undefined =>
  semesters.find((s) => s.status === "OPEN") ?? semesters[0];

/** 인천대 학사행정(ERP) tmGbn 코드로 변환 */
export const termToTmGbn = (term: Term): string => {
  switch (term) {
    case "FIRST":
      return "10";
    case "SUMMER":
      return "11";
    case "SECOND":
      return "20";
    case "WINTER":
      return "21";
    default:
      return "10";
  }
};

/** 인천대 학사행정(ERP) tmGbn 코드를 Term으로 역변환 */
export const tmGbnToTerm = (tmGbn: string): Term => {
  switch (tmGbn) {
    case "10":
      return "FIRST";
    case "11":
      return "SUMMER";
    case "20":
      return "SECOND";
    case "21":
      return "WINTER";
    default:
      return "FIRST";
  }
};

