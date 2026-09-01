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
  id: number | null;
  location: string | null;
  sequence: number | null;
  day: TimeTableDay;
  startTime: string; // HH:mm
  endTime: string; // HH:mm
}

export interface TimeTableCourseItem {
  courseOfferingId: number | null;
  courseId: number | null;
  title: string | null;
  professor: string | null;
  subjectNumber: string | null;
  credit: string | number | null;
  meetings: TimeTableMeeting[];
  /** 성적 평가 방식. 개설강의 응답의 같은 이름 필드와 같은 값. */
  gradeEvaluationName?: string | null;
}

export interface TimeTableCustomScheduleItem {
  customScheduleId: number | null;
  title: string | null;
  meetings: TimeTableMeeting[];
}

// type에 따라 course 또는 customSchedule 중 하나만 값을 가짐
export interface TimeTableDetailItem {
  id: number | null;
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

// --- 시간표 요소(TimeTableItem) 요청/응답 DTO ---

export interface TimeTableCourseItemRequest {
  courseOfferingId: number;
  memo?: string;
}

export interface TimeTableCustomMeetingRequest {
  location?: string;
  day: TimeTableDay;
  startTime: string; // HH:mm
  endTime: string; // HH:mm
}

export interface TimeTableCustomItemRequest {
  title: string;
  memo?: string;
  meetings: TimeTableCustomMeetingRequest[];
}

// 요소 생성/수정 응답 (meetings가 없으므로 상세 재조회로 그리드를 갱신해야 함)
export interface TimeTableItemSummary {
  id: number;
  type: TimeTableItemType;
  title?: string;
  memo?: string | null;
}

// 시간표 AI 평가 응답 인터페이스
export interface TimeTableEvaluation {
  timeTableId: number;
  content: string;
  timetableHash: string;
  isCached: boolean;
  regenerateCount?: number;
  remainingCount?: number;
  updatedAt?: string;
}

