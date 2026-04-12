export interface SchoolSchedule {
  title: string; // 제목
  start: string; // 시작 날짜
  end: string; // 종료 날짜
}

export interface DeptSchedule extends SchoolSchedule {
  description: string; // 상세 설명
  aiGenerated: boolean; // AI 생성 여부
  department: string; // 담당 학과
  sourceNoticeId: number; // 원본 공지 사항 ID
  sourceNoticeTitle: string; // 원본 공지 제목
  url: string; // 상세 페이지 주소
}

// 이벤트 타입 정의
export type ScheduleType = "school" | "dept";

// types/schedules.ts 또는 컴포넌트 상단
export type EventItemData =
  | ({ type: "school" } & SchoolSchedule)
  | ({ type: "dept" } & DeptSchedule);
