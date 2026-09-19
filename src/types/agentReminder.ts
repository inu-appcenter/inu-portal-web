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

