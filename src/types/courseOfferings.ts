import type { Term, TimeTableDay } from "@/types/timetables";

export interface CourseOfferingMeeting {
  id: number;
  location: string | null;
  // 서버 예시에는 "야3"처럼 한글이 섞인 문자열로 내려옴 (TimeTableMeeting.sequence는 number라 별도 타입)
  sequence: string | null;
  day: TimeTableDay;
  startTime: string; // HH:mm
  endTime: string; // HH:mm
}

// GET /api/course-offerings 응답 항목. id가 시간표 요소 생성 API의 courseOfferingId.
// 학점/학과/학년 등 교육과정 메타데이터는 없어 courseId(=Course.id)로 /api/courses
// 응답과 조인해서 보강해야 함
export interface CourseOffering {
  id: number;
  syllabus: string | null;
  subjectNumber: string;
  method: string | null;
  professor: string | null;
  courseId: number;
  courseTitle: string;
  semesterId: number;
  year: number;
  term: Term;
  targetDepartment: string | null;
  language: string | null;
  capacity: number | null;
  enrolledCount: number | null;
  note: string | null;
  meetings: CourseOfferingMeeting[];
}

// GET /api/course-offerings에 아직 없는 필터 querystring (inu-appcenter/inu-portal-server#297
// 요청). 서버가 지원하기 전까지는 보내도 무시된다.
export interface CourseOfferingFilters {
  department?: string;
  grades?: number[];
  types?: string[];
  credits?: number[];
}
