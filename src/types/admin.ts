export interface MemberLogData {
  memberCount: number;
  memberIds: string[];
}

export interface ApiLogData {
  method: string;
  uri: string;
  apiCount: number;
}

export type AdminNotificationTargetType =
  | "ALL"
  | "LOGGED_IN"
  | "LOGGED_OUT"
  | "MEMBERS"
  | "STUDENT_IDS"
  | "DEPARTMENTS";

export const isAdminUser = (role?: string): boolean => {
  if (!role) return false;
  return role.toLowerCase().includes("admin");
};

export type AdminNotificationSubFilter =
  | "NONE"
  | "NO_TIMETABLE_CURRENT_SEMESTER"
  | "EMPTY_TIMETABLE"
  | "PAST_USER_NO_CURRENT_TIMETABLE"
  | "NO_FRIENDS"
  | "NO_COMMUNITY_ACTIVITY";

export type FcmSendStatus =
  | "PENDING"
  | "PROCESSING"
  | "SUCCESS"
  | "PARTIAL_FAILURE"
  | "FAILED"
  | "NO_TARGET";

export interface FcmAdminLogData {
  id: number;
  title: string;
  body: string;
  targetCount: number;
  sendCount: number;
  failureCount: number;
  status: FcmSendStatus;
}

export interface FcmSendRequest {
  targetType: AdminNotificationTargetType;
  subFilter?: AdminNotificationSubFilter;
  memberIds?: number[];
  studentIds?: string[];
  departments?: string[];
  title: string;
  content: string;
  path?: string;
  // 값이 있으면 예약 발송, 없으면(undefined) 기존과 동일한 즉시 발송.
  // "YYYY-MM-DDTHH:mm:ss" 형식(초 단위, 서버 기준 KST wall-clock)이어야 한다.
  scheduledAt?: string;
}

export type ScheduledNotificationStatus =
  | "SCHEDULED"
  | "DISPATCHING"
  | "SENT"
  | "FAILED"
  | "CANCELED"
  | "EXPIRED";

export interface ScheduledNotificationData {
  id: number;
  title: string;
  content: string;
  path: string | null;
  targetType: AdminNotificationTargetType;
  subFilter: AdminNotificationSubFilter;
  scheduledAt: string;
  status: ScheduledNotificationStatus;
  fcmMessageId: number | null;
  failureReason: string | null;
}
