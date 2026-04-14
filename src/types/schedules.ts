export interface Schedule {
  id: number;
  title: string;
  description: string | null;
  start: string;
  end: string;
  aiGenerated: boolean;
  department: string | null;
  sourceNoticeId: number | null;
  sourceNoticeTitle: string | null;
  url: string | null;
}

export type ScheduleType = "school" | "dept";

export interface ScheduleEvent extends Schedule {
  type: ScheduleType;
}

export const getScheduleType = (
  schedule: Pick<Schedule, "department">,
): ScheduleType => (schedule.department ? "dept" : "school");

export const toScheduleEvent = (
  schedule: Schedule,
  type: ScheduleType = getScheduleType(schedule),
): ScheduleEvent => ({
  ...schedule,
  type,
});
