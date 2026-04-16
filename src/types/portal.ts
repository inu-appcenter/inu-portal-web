/**
 * 학생 기본 학적 정보 인터페이스
 */
export interface StudentInfo {
  // 기본 인적 사항
  studentId: string; // 학번
  koreanName: string; // 성명(한글)
  englishName: string; // 성명(영문)
  genderCode: string; // 성별 코드 (M/F)
  genderName: string; // 성별 명칭
  birthDate: string; // 생년월일 (YYYY-MM-DD)
  mobilePhone: string; // 휴대전화 번호
  nationalityCode: string; // 국적 코드
  nationalityName: string; // 국적 명칭
  residentRegistrationNumberMasked: string; // 주민등록번호(마스킹)

  // 학적 상태 및 소속
  enrollmentStatusCode: string; // 학적상태 코드
  enrollmentStatusName: string; // 학적상태 명칭 (예: 재학(졸업유예))
  courseCode: string; // 과정 코드
  courseName: string; // 과정 명칭 (예: 학사)
  collegeGroupCode: string; // 대학그룹 코드
  collegeGroupName: string; // 대학그룹 명칭
  collegeCode: string; // 대학 코드
  collegeName: string | null; // 대학 명칭
  departmentCode: string; // 학부 코드
  departmentName: string | null; // 학부 명칭
  majorCode: string; // 전공 코드
  majorName: string | null; // 전공 명칭
  advisorProfessorName: string; // 지도교수 성함

  // 입학 및 변동 정보
  entranceDate: string; // 입학 일자
  entranceClassificationCode: string; // 입학구분 코드
  entranceClassificationName: string; // 입학구분 명칭
  entranceTypeCode: string; // 입학유형 코드
  entranceTypeName: string; // 입학유형 명칭
  latestEnrollmentChangeCode: string; // 최신 학적변동 코드
  latestEnrollmentChangeName: string; // 최신 학적변동 명칭
  latestEnrollmentChangeDate: string; // 최신 학적변동 일자

  // 이수 및 성적
  semesterSequenceCode: string; // 학기차수 코드
  semesterSequenceName: string; // 학기차수 명칭
  completedSemesterCode: string; // 이수학기 코드
  completedSemesterName: string; // 이수학기 명칭 (예: 8 (0))
  completedSemesterCount: string; // 이수학기 수
  acquiredCredits: string; // 취득 학점
  gradeAverage: string; // 평균 평점 (공백 포함 가능성 주의)

  // 기타 여부 및 상태
  militaryStatusCode: string; // 병역상태 코드
  militaryStatusName: string | null; // 병역상태 명칭
  readmissionYn: "0" | "1"; // 재입학 여부
  earlyGraduationYn: "0" | "1"; // 조기졸업 여부
  graduationExpectedYn: "0" | "1"; // 졸업예정 여부
  bcrmstConnectionYn: "0" | "1"; // BCRMST 연동 여부
  capacityIoCode: string; // 정원 내외 코드
  capacityIoName: string; // 정원 내외 명칭
  skillStandardCode: string; // 숙련표준 코드
  skillStandardName: string; // 숙련표준 명칭
}

/**
 * API 전체 응답 구조
 */
export interface StudentInfoResponse {
  data: StudentInfo;
  msg: string;
}
