export type ScheduleScope = "ALL" | "SCHOOL_ONLY" | "DEPT_ONLY";

export type TimetablePreAlertOffset = 10 | 20 | 30 | 60; // 분 단위

export interface DailyBriefSettings {
  // 시간표 알림 설정
  timetableAlertEnabled: boolean; // 전체 시간표 알림 활성화 여부
  timetablePreAlertEnabled: boolean; // 수업 시작 전 알림 활성화 여부
  timetablePreAlertMinutes: TimetablePreAlertOffset; // 수업 n분 전 (10, 20, 30, 60)
  timetableDailyBriefEnabled: boolean; // 당일 강의 묶음 알림 활성화 여부
  timetableDailyBriefTime: string; // "HH:mm" 포맷 (예: "08:00")

  // 학사일정 알림 설정
  scheduleAlertEnabled: boolean; // 전체 학사일정 알림 활성화 여부
  scheduleDailyBriefTime: string; // "HH:mm" 포맷 (예: "08:30")
  scheduleScope: ScheduleScope; // "ALL" | "SCHOOL_ONLY" | "DEPT_ONLY"
}

export const DEFAULT_DAILY_BRIEF_SETTINGS: DailyBriefSettings = {
  timetableAlertEnabled: true,
  timetablePreAlertEnabled: true,
  timetablePreAlertMinutes: 10,
  timetableDailyBriefEnabled: true,
  timetableDailyBriefTime: "08:00",
  scheduleAlertEnabled: true,
  scheduleDailyBriefTime: "08:30",
  scheduleScope: "ALL",
};
