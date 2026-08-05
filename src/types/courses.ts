export interface Course {
  id: number;
  title: string;
  departmentCode: string;
  departmentName: string;
  collegeCode: string;
  collegeName: string;
  targetGradeCode: string;
  targetGradeName: string;
  targetTermCode: string;
  targetTermName: string;
  completionDivisionCode: string;
  completionDivisionName: string;
  // 실서버(GET /api/courses)는 숫자로 내려준다. 스웨거 예시에는 문자열("3")로 적혀
  // 있지만 실응답 확인 결과 number이며, 예전 타입(string)이 틀렸던 것이다.
  credit: number;
  content: string;
  active: boolean;
}
