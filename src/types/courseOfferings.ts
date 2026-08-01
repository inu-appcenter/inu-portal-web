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

// GET /api/course-offerings 응답 항목. 개설 강의 자체의 id는 내려오지 않아
// courseId(=Course.id)로 /api/courses 응답과 조인해서 학점 등 상세 정보를 보강해야 함
export interface CourseOffering {
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
