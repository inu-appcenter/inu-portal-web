export type Term = "FIRST" | "SUMMER" | "SECOND" | "WINTER";

export type TimeTableVisibility = "PUBLIC" | "PROTECTED" | "PRIVATE";

export interface TimeTable {
  id: number;
  semesterId: number;
  year: number;
  term: Term;
  timeTableName: string;
  isPrimary: boolean;
  visibility: TimeTableVisibility;
}
