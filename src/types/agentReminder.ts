export type AgentReminderRepeatType =
  | "EVERYDAY"
  | "WEEKDAYS"
  | "WEEKENDS"
  | "ONCE";

export interface RoutineScheduleItem {
  days: string[]; // ["MON", "TUE", ...]
  time: string; // "08:30"
  repeatType?: AgentReminderRepeatType;
}

export type RoutineTriggerType =
  | "TIME"
  | "SCHOOL_NOTICE"
  | "DEPT_NOTICE"
  | "BEFORE_CLASS";

export interface RoutineTriggerCondition {
  id: string;
  type: RoutineTriggerType;
  title: string;
  subtitle: string;
  timeParams?: {
    ampm: "AM" | "PM";
    hour: string;
    minute: string;
    selectedDays: string[];
    repeatType: AgentReminderRepeatType;
  };
  deptParams?: {
    deptCode: string;
    deptName: string;
  };
  beforeClassParams?: {
    minutes: number;
  };
}

export type RoutineActionType =
  | "DEPT_NOTICE"
  | "SCHOOL_NOTICE"
  | "TIMETABLE"
  | "SCHEDULE"
  | "WEATHER"
  | "BUS"
  | "CAFETERIA";

export interface RoutineActionBlock {
  id: string;
  type: RoutineActionType;
  title: string;
  subtitle: string;
  iconBg: string;
  deptNoticeParams?: {
    deptCode: string;
    deptName: string;
    includeKeywords: string[];
    excludeKeywords: string[];
  };
  schoolNoticeParams?: {
    categories: string[];
    includeKeywords: string[];
    excludeKeywords: string[];
  };
  busParams?: {
    stopName: string;
  };
  cafeteriaParams?: {
    restaurant: string;
    mealType: "AUTO" | "LUNCH" | "DINNER";
  };
  scheduleParams?: {
    scope: "ALL" | "SCHOOL_ONLY" | "DEPT_ONLY";
    advanceDays: number;
  };
}

export interface AgentReminder {
  id: number;
  title: string;
  targetTime: string; // "11:00"
  repeatType: AgentReminderRepeatType;
  repeatTypeDesc: string; // "평일(월~금)"
  targetTool: string; // "CAFETERIA", "WEATHER", "BUS", etc.
  toolParamsJson?: string;
  schedulesJson?: string;
  titleTemplate?: string;
  bodyTemplate?: string;
  route: string;
  enabled: boolean;
  createdAt: string;
}

export interface AgentReminderCreateRequest {
  title: string;
  targetTime: string;
  repeatType: AgentReminderRepeatType;
  targetTool: string;
  toolParamsJson?: string;
  schedulesJson?: string;
  titleTemplate?: string;
  bodyTemplate?: string;
  route?: string;
}

export interface AgentReminderUpdateRequest {
  title?: string;
  targetTime?: string;
  repeatType?: AgentReminderRepeatType;
  targetTool?: string;
  toolParamsJson?: string;
  schedulesJson?: string;
  titleTemplate?: string;
  bodyTemplate?: string;
  route?: string;
  enabled?: boolean;
}
