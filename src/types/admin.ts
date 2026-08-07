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
}
