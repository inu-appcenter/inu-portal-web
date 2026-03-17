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

export type FcmSendStatus =
  | "PENDING"
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
  memberIds?: number[];
  studentIds?: string[];
  departments?: string[];
  title: string;
  content: string;
}
