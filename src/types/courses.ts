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
  credit: string;
  content: string;
  active: boolean;
}
