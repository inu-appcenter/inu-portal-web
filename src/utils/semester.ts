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

export const sortSemestersDesc = (semesters: Semester[]) =>
  [...semesters].sort(
    (a, b) => b.year - a.year || TERM_ORDER[b.term] - TERM_ORDER[a.term],
  );

// 서버 학기 목록에서 "지금" 학기를 고른다. status가 OPEN인 학기를 우선하고,
// 없으면(학기 전환기 등) 가장 최근 학기로 대체한다.
//
// semesters[0](정렬 후 최신 항목)을 그냥 쓰면 안 되는 이유: 다음 학기가 등록 시작
// 전부터(과목 편람만 채워진 UPCOMING 상태로) 서버에 미리 들어올 수 있는데, 정렬은
// status를 보지 않고 연도/학기 순서로만 매기므로 이 경우 semesters[0]이 아직 아무도
// 쓰지 않는 미래 학기가 돼 버린다(#235).
export const pickCurrentSemester = <T extends { status: Semester["status"] }>(
  semesters: T[],
): T | undefined =>
  semesters.find((s) => s.status === "OPEN") ?? semesters[0];
