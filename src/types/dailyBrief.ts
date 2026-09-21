export type ScheduleScope = "ALL" | "SCHOOL_ONLY" | "DEPT_ONLY";

export type TimetablePreAlertOffset = number; // 분 단위 (기본: 5, 10, 15, 20, 30, 45, 60 등)

export type DailyBriefCardType =
  | "timetable"
  | "library"
  | "cafeteria"
  | "bus"
  | "weather"
  | "notice"
  | "lms"
  | "fortune";

export interface DailyBriefTimeRule {
  id: string;
  startHour: number; // 0 ~ 23
  startMinute: number; // 0 ~ 59
  endHour: number;
  endMinute: number;
  pinCard: DailyBriefCardType;
  label?: string;
}

export interface DailyBriefCardDetailConfig {
  library?: {
    selectedRooms?: string[]; // e.g. ["제1열람실", "제2열람실", "제3열람실", "힐링존"]
  };
  cafeteria?: {
    preferredCafeteria?: string; // e.g. "학생식당", "제1기숙사식당"
  };
  bus?: {
    defaultType?: "auto" | "go-school" | "go-home";
    defaultStopName?: string;
  };
}

export interface DailyBriefCardSettings {
  mode: "auto" | "custom";
  order: DailyBriefCardType[];
  visibility: Record<DailyBriefCardType, boolean>;
  details: DailyBriefCardDetailConfig;
  timeRules: DailyBriefTimeRule[];
}

export const DEFAULT_DAILY_BRIEF_CARD_SETTINGS: DailyBriefCardSettings = {
  mode: "auto",
  order: [
    "timetable",
    "library",
    "cafeteria",
    "bus",
    "weather",
    "notice",
    "lms",
    "fortune",
  ],
  visibility: {
    timetable: true,
    library: true,
    cafeteria: true,
    bus: true,
    weather: true,
    notice: true,
    lms: true,
    fortune: true,
  },
  details: {
    library: {
      selectedRooms: ["제1열람실", "제2열람실", "제3열람실", "힐링존"],
    },
    cafeteria: {
      preferredCafeteria: "학생식당",
    },
    bus: {
      defaultType: "auto",
    },
  },
  timeRules: [],
};

export interface DailyBriefSettings {
  // 시간표 알림 설정
  timetableAlertEnabled: boolean; // 전체 시간표 알림 활성화 여부
  timetablePreAlertEnabled: boolean; // 수업 시작 전 알림 활성화 여부
  timetablePreAlertMinutes: number; // 수업 n분 전
  timetableDailyBriefEnabled: boolean; // 당일 강의 묶음 알림 활성화 여부
  timetableDailyBriefTime: string; // "HH:mm" 포맷 (예: "08:00")

  // 학사일정 알림 설정
  scheduleAlertEnabled: boolean; // 전체 학사일정 알림 활성화 여부
  scheduleDailyBriefTime: string; // "HH:mm" 포맷 (예: "08:30")
  scheduleScope: ScheduleScope; // "ALL" | "SCHOOL_ONLY" | "DEPT_ONLY"
  advanceDays?: number; // 0, 1, 3, 7 등

  // 카드 구성 및 세부 설정 JSON
  cardSettingsJson?: string;
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
  advanceDays: 1,
};
