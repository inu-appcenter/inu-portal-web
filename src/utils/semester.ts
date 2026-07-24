import type { Term } from "@/types/timetables";

export const TERM_LABELS: Record<Term, string> = {
  FIRST: "1학기",
  SUMMER: "여름학기",
  SECOND: "2학기",
  WINTER: "겨울학기",
};

export const formatSemester = (year: number, term: Term) =>
  `${year}년 ${TERM_LABELS[term]}`;
