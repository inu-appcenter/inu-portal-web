import type { Term } from "@/types/timetables";

export type SemesterStatus = "UPCOMING" | "OPEN" | "CLOSED";

export interface Semester {
  id: number;
  year: number;
  term: Term;
  status: SemesterStatus;
  startDate: string;
  endDate: string;
}
