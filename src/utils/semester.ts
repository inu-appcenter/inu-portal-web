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
