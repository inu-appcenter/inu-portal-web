import type { Semester } from "@/types/semesters";
import type { Course } from "@/types/courses";
import type { CourseOffering } from "@/types/courseOfferings";

// 마법사 화면을 실제 로그인 세션 없이 1:1로 검증하기 위한 목 데이터.
// 조건 카드(공강/오전없음/야간제외/연강/통학)가 전부 최소 한 번씩 성립/불성립하도록
// 요일·시간대를 의도적으로 구성했다: 금요일은 소수 과목만 배치(공강 조건 테스트),
// 월요일 13:00~16:45는 3연강 블록(연강 조건 테스트), 화/목 18시대는 야간 수업(야간 조건 테스트).

export const MOCK_SEMESTER: Semester = {
  id: 9001,
  year: 2026,
  term: "SECOND",
  status: "OPEN",
  startDate: "2026-09-01",
  endDate: "2026-12-20",
};

export const MOCK_SEMESTERS: Semester[] = [
  MOCK_SEMESTER,
  {
    id: 9000,
    year: 2026,
    term: "FIRST",
    status: "CLOSED",
    startDate: "2026-03-02",
    endDate: "2026-06-19",
  },
];

interface MockCourseSeed {
  id: number;
  title: string;
  departmentName: string;
  credit: number;
  targetGradeName: string;
}

const SEEDS: MockCourseSeed[] = [
  { id: 1, title: "프로그래밍입문", departmentName: "컴퓨터공학부", credit: 3, targetGradeName: "1학년" },
  { id: 2, title: "자료구조", departmentName: "컴퓨터공학부", credit: 3, targetGradeName: "2학년" },
  { id: 3, title: "운영체제", departmentName: "컴퓨터공학부", credit: 3, targetGradeName: "3학년" },
  { id: 4, title: "웹프로그래밍", departmentName: "컴퓨터공학부", credit: 3, targetGradeName: "3학년" },
  { id: 5, title: "컴퓨터공학개론", departmentName: "컴퓨터공학부", credit: 3, targetGradeName: "1학년" },
  { id: 6, title: "데이터베이스", departmentName: "컴퓨터공학부", credit: 3, targetGradeName: "3학년" },
  { id: 7, title: "알고리즘", departmentName: "컴퓨터공학부", credit: 3, targetGradeName: "3학년" },
  { id: 8, title: "인공지능개론", departmentName: "컴퓨터공학부", credit: 3, targetGradeName: "4학년" },
  { id: 9, title: "대학수학(1)", departmentName: "수학과", credit: 3, targetGradeName: "1학년" },
  { id: 10, title: "일반물리학", departmentName: "물리학과", credit: 3, targetGradeName: "1학년" },
  { id: 11, title: "Academic English", departmentName: "교양", credit: 2, targetGradeName: "공통" },
  { id: 12, title: "창의적사고와문제해결", departmentName: "교양", credit: 2, targetGradeName: "공통" },
  { id: 13, title: "소셜커뮤니케이션", departmentName: "교양", credit: 2, targetGradeName: "공통" },
  { id: 14, title: "자기설계세미나", departmentName: "교양", credit: 1, targetGradeName: "공통" },
  { id: 15, title: "경영학원론", departmentName: "경영학부", credit: 3, targetGradeName: "1학년" },
  { id: 16, title: "마케팅원론", departmentName: "경영학부", credit: 3, targetGradeName: "2학년" },
  { id: 17, title: "회계원리", departmentName: "세무회계학과", credit: 3, targetGradeName: "1학년" },
  { id: 18, title: "심리학개론", departmentName: "교양", credit: 3, targetGradeName: "공통" },
  { id: 19, title: "영어회화", departmentName: "교양", credit: 2, targetGradeName: "공통" },
  { id: 20, title: "스포츠와건강", departmentName: "교양", credit: 1, targetGradeName: "공통" },
  { id: 21, title: "야간세미나", departmentName: "교양", credit: 2, targetGradeName: "공통" },
  { id: 22, title: "저녁교양", departmentName: "교양", credit: 1, targetGradeName: "공통" },
  // 토요일 개설강의 - 그리드 요일 자동 확장 검증용 (inu-appcenter/inu-portal-server#297)
  { id: 23, title: "토요특강", departmentName: "교양", credit: 1, targetGradeName: "공통" },
];

export const MOCK_COURSES: Course[] = SEEDS.map((s) => ({
  id: s.id,
  title: s.title,
  departmentCode: s.departmentName,
  departmentName: s.departmentName,
  collegeCode: "MOCK_COLLEGE",
  collegeName: "정보기술대학",
  targetGradeCode: s.targetGradeName,
  targetGradeName: s.targetGradeName,
  targetTermCode: "SECOND",
  targetTermName: "2학기",
  completionDivisionCode: s.departmentName === "교양" ? "GENERAL" : "MAJOR",
  completionDivisionName: s.departmentName === "교양" ? "교양" : "전공",
  credit: s.credit,
  content: `${s.title} 강의개요 (목 데이터)`,
  active: true,
}));

interface MockMeetingSeed {
  day: "MONDAY" | "TUESDAY" | "WEDNESDAY" | "THURSDAY" | "FRIDAY" | "SATURDAY";
  startTime: string;
  endTime: string;
  location: string;
}

interface MockOfferingSeed {
  courseId: number;
  subjectNumber: string;
  professor: string;
  meetings: MockMeetingSeed[];
}

const OFFERING_SEEDS: MockOfferingSeed[] = [
  { courseId: 1, subjectNumber: "2600001001", professor: "김민준", meetings: [{ day: "MONDAY", startTime: "09:00", endTime: "10:15", location: "07-407" }] },
  { courseId: 1, subjectNumber: "2600001002", professor: "김민준", meetings: [{ day: "WEDNESDAY", startTime: "09:00", endTime: "10:15", location: "07-420" }] }, // 같은 과목 다른 분반
  { courseId: 2, subjectNumber: "2600002001", professor: "이서연", meetings: [{ day: "TUESDAY", startTime: "10:30", endTime: "11:45", location: "07-408" }] },
  { courseId: 3, subjectNumber: "2600003001", professor: "박지훈", meetings: [{ day: "TUESDAY", startTime: "09:00", endTime: "10:15", location: "07-407" }] },
  { courseId: 4, subjectNumber: "2600004001", professor: "최유진", meetings: [{ day: "WEDNESDAY", startTime: "10:30", endTime: "11:45", location: "07-409" }] },
  { courseId: 5, subjectNumber: "2600005001", professor: "정하늘", meetings: [{ day: "WEDNESDAY", startTime: "09:00", endTime: "10:15", location: "07-410" }] },
  { courseId: 6, subjectNumber: "2600006001", professor: "강수현", meetings: [{ day: "THURSDAY", startTime: "13:00", endTime: "14:15", location: "07-411" }] },
  // 월요일 13:00~16:45 3연강 블록 (연강 조건 테스트용)
  { courseId: 9, subjectNumber: "2600009001", professor: "서지민", meetings: [{ day: "MONDAY", startTime: "13:00", endTime: "14:15", location: "12-402" }] },
  { courseId: 7, subjectNumber: "2600007001", professor: "오세훈", meetings: [{ day: "MONDAY", startTime: "14:15", endTime: "15:30", location: "07-412" }] },
  { courseId: 8, subjectNumber: "2600008001", professor: "윤도현", meetings: [{ day: "MONDAY", startTime: "15:30", endTime: "16:45", location: "07-413" }] },
  { courseId: 10, subjectNumber: "2600010001", professor: "한지수", meetings: [{ day: "WEDNESDAY", startTime: "13:00", endTime: "14:15", location: "05-101" }] },
  { courseId: 11, subjectNumber: "2600011001", professor: "Sarah Kim", meetings: [{ day: "THURSDAY", startTime: "09:00", endTime: "09:50", location: "12-402" }] },
  { courseId: 12, subjectNumber: "2600012001", professor: "이도현", meetings: [{ day: "THURSDAY", startTime: "10:30", endTime: "11:45", location: "12-304" }] },
  // 금요일은 소수 과목만 배치 (특정 요일 공강 조건 테스트용)
  { courseId: 13, subjectNumber: "2600013001", professor: "김하윤", meetings: [{ day: "FRIDAY", startTime: "10:30", endTime: "11:45", location: "12-404" }] },
  { courseId: 14, subjectNumber: "2600014001", professor: "박서준", meetings: [{ day: "TUESDAY", startTime: "13:00", endTime: "13:50", location: "12-403" }] },
  { courseId: 15, subjectNumber: "2600015001", professor: "이준서", meetings: [{ day: "MONDAY", startTime: "10:30", endTime: "11:45", location: "03-201" }] },
  { courseId: 16, subjectNumber: "2600016001", professor: "최민서", meetings: [{ day: "WEDNESDAY", startTime: "15:00", endTime: "16:15", location: "03-202" }] },
  { courseId: 17, subjectNumber: "2600017001", professor: "정우진", meetings: [{ day: "THURSDAY", startTime: "15:00", endTime: "16:15", location: "03-203" }] },
  { courseId: 18, subjectNumber: "2600018001", professor: "강예은", meetings: [{ day: "WEDNESDAY", startTime: "16:30", endTime: "17:45", location: "12-305" }] },
  { courseId: 19, subjectNumber: "2600019001", professor: "James Lee", meetings: [{ day: "FRIDAY", startTime: "13:00", endTime: "13:50", location: "15-403" }] },
  { courseId: 20, subjectNumber: "2600020001", professor: "박태현", meetings: [{ day: "FRIDAY", startTime: "15:00", endTime: "15:50", location: "체육관" }] },
  // 야간 수업 (야간 수업 제외 조건 테스트용)
  { courseId: 21, subjectNumber: "2600021001", professor: "야간강사A", meetings: [{ day: "THURSDAY", startTime: "18:00", endTime: "19:30", location: "12-306" }] },
  { courseId: 22, subjectNumber: "2600022001", professor: "야간강사B", meetings: [{ day: "TUESDAY", startTime: "18:00", endTime: "18:50", location: "12-405" }] },
  { courseId: 23, subjectNumber: "2600023001", professor: "특강강사", meetings: [{ day: "SATURDAY", startTime: "10:00", endTime: "12:00", location: "15-501" }] },
];

let meetingIdCounter = 90000;

export const MOCK_COURSE_OFFERINGS: CourseOffering[] = OFFERING_SEEDS.map((seed, index) => {
  const course = MOCK_COURSES.find((c) => c.id === seed.courseId)!;
  return {
    id: index + 1,
    syllabus: null,
    subjectNumber: seed.subjectNumber,
    method: "OFFLINE",
    professor: seed.professor,
    courseId: seed.courseId,
    courseTitle: course.title,
    semesterId: MOCK_SEMESTER.id,
    year: MOCK_SEMESTER.year,
    term: MOCK_SEMESTER.term,
    targetDepartment: null,
    language: "KOREAN",
    capacity: 40,
    enrolledCount: 12,
    note: null,
    hyCode: course.targetGradeCode,
    hyName: course.targetGradeName,
    isuCode: course.completionDivisionCode,
    isuName: course.completionDivisionName,
    deptCode: course.departmentCode,
    deptName: course.departmentName,
    collegeCode: course.collegeCode,
    collegeName: course.collegeName,
    credit: course.credit,
    meetings: seed.meetings.map((m) => ({
      id: meetingIdCounter++,
      location: m.location,
      sequence: null,
      day: m.day,
      startTime: m.startTime,
      endTime: m.endTime,
    })),
  };
});
