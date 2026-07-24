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

export type TimeTableDay =
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY"
  | "SUNDAY";

export type TimeTableItemType = "COURSE" | "CUSTOM";

export interface TimeTableMeeting {
  id: number;
  location: string | null;
  sequence: number | null;
  day: TimeTableDay;
  startTime: string; // HH:mm
  endTime: string; // HH:mm
}

export interface TimeTableCourseItem {
  courseOfferingId: number;
  courseId: number;
  title: string;
  professor: string;
  subjectNumber: string;
  credit: string;
  meetings: TimeTableMeeting[];
}

export interface TimeTableCustomScheduleItem {
  customScheduleId: number;
  title: string;
  meetings: TimeTableMeeting[];
}

// type에 따라 course 또는 customSchedule 중 하나만 값을 가짐
export interface TimeTableDetailItem {
  id: number;
  type: TimeTableItemType;
  memo: string | null;
  course: TimeTableCourseItem | null;
  customSchedule: TimeTableCustomScheduleItem | null;
}

export interface TimeTableDetail {
  id: number;
  timeTableName: string;
  year: number;
  term: Term;
  items: TimeTableDetailItem[];
}
