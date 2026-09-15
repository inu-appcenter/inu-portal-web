export type AgentReminderRepeatType =
  | "EVERYDAY"
  | "WEEKDAYS"
  | "WEEKENDS"
  | "ONCE";

export interface AgentReminder {
  id: number;
  title: string;
  targetTime: string; // "11:00"
  repeatType: AgentReminderRepeatType;
  repeatTypeDesc: string; // "평일(월~금)"
  targetTool: string; // "CAFETERIA", "WEATHER", "BUS", etc.
  toolParamsJson?: string;
  titleTemplate?: string;
  bodyTemplate?: string;
  route: string;
  enabled: boolean;
  createdAt: string;
}

export interface AgentReminderUpdateRequest {
  title?: string;
  targetTime?: string;
  repeatType?: AgentReminderRepeatType;
  toolParamsJson?: string;
  titleTemplate?: string;
  bodyTemplate?: string;
  route?: string;
  enabled?: boolean;
}
