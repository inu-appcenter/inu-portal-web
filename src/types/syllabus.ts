// 서버 명세(GET /api/syllabus): content는 강의계획서 원본 양식 그대로 한글 키를 쓰며,
// 값이 없는 필드는 null일 수 있다.

export interface SyllabusBook {
  교재명?: string | null;
  저자?: string | null;
  출판사?: string | null;
  발행년도?: string | null;
}

export interface SyllabusWeeklyPlanItem {
  주차?: number | null;
  내용?: string | null;
}

export interface SyllabusAssignmentItem {
  번호?: number | null;
  과제명?: string | null;
  제출일?: string | null;
  목표?: string | null;
  진행방법및유의사항?: string | null;
  참고자료?: string | null;
}

export interface SyllabusMajorCompetencyWeight {
  전공능력?: string | null;
  가중치?: number | null;
}

export interface SyllabusBooks {
  주교재?: SyllabusBook[] | null;
  참고서적?: SyllabusBook[] | null;
  기타서적?: string | null;
}

export interface SyllabusContent {
  년도?: number | null;
  학기?: string | null;
  출력일시?: string | null;
  과목명?: string | null;
  과목코드?: string | null;
  이수구분?: string | null;
  성적평가방법?: string | null;
  부복수전공절대평가여부?: string | null;
  집중이수제구분?: string | null;
  전화번호?: string | null;
  요일교시강의실?: string | null;
  면담가능시간?: string | null;
  원어강의구분?: string | null;
  학과?: string | null;
  학년?: string | null;
  소속?: string | null;
  교수?: string | null;
  학점?: string | null;
  강의?: string | null;
  실습?: string | null;
  교과목개요및목적?: string | null;
  수업목표?: string | null;
  수업진행방법?: string | null;
  // 키-정수 맵 (예: { 강의: 60, 토론: 0, ... })
  수업방식비율?: Record<string, number | null> | null;
  기자재활용비율?: Record<string, number | null> | null;
  학습평가방법?: string | null;
  성적평가비율?: Record<string, number | null> | null;
  유의사항?: string[] | null;
  교재?: SyllabusBooks | null;
  주별수업계획?: SyllabusWeeklyPlanItem[] | null;
  과제?: SyllabusAssignmentItem[] | null;
  장애학생학습지원?: string | null;
  핵심역량가중치?: Record<string, number | null> | null;
  전공능력가중치?: SyllabusMajorCompetencyWeight[] | null;
  _sections?: number[] | null;
  _pages?: number[] | null;
}

export interface Syllabus {
  id: number;
  courseOfferingId: number;
  content: SyllabusContent;
}
