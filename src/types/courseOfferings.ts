import type { Term, TimeTableDay } from "@/types/timetables";

export interface CourseOfferingMeeting {
  id: number;
  location: string | null;
  sequence: string | null;
  day: TimeTableDay;
  startTime: string; // HH:mm
  endTime: string; // HH:mm
}

// GET /api/course-offerings 응답 항목
export interface CourseOffering {
  id: number;
  syllabus: string | null;
  subjectNumber: string;
  method?: string | null;
  professor: string | null;
  courseId: number;
  courseCode?: string | null;
  courseTitle: string;
  courseTitleEng?: string | null;
  semesterId: number;
  year: number;
  term: Term;
  termName?: string | null;
  cnctrIsuCode?: string | null;
  cnctrIsuName?: string | null;
  deptCode?: string | null;
  deptName?: string | null;
  collegeCode?: string | null;
  collegeName?: string | null;
  isuFldCode?: string | null;
  isuFldName?: string | null;
  isuCode?: string | null;
  isuName?: string | null;
  ssupTypeCode?: string | null;
  ssupTypeName?: string | null;
  hyCode?: string | null;
  hyName?: string | null;
  englishCode?: string | null;
  englishName?: string | null;
  credit?: number | null;
  capacity: number | null;
  enrolledCount: number | null;
  savedCount?: number | null;
  note: string | null;
  meetings: CourseOfferingMeeting[];
}

// GET /api/course-offerings 쿼리 파라미터 필터
export interface CourseOfferingFilters {
  deptName?: string;
  collegeName?: string;
  hyNames?: string[];
  isuNames?: string[];
  isuFldNames?: string[];
  ssupTypeNames?: string[];
  credits?: number[];
  keyword?: string;
  meetingFilterMode?: "HAS_CLASS" | "NO_CLASS";
  meetings?: string[];
  sort?: "DEFAULT" | "SAVED_COUNT_DESC" | "SAVED_COUNT_ASC";
}

