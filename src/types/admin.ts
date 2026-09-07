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
  | "NO_TARGET"
  | "ABANDONED";

export interface FcmAdminLogData {
  id: number;
  title: string;
  body: string;
  targetCount: number;
  sendCount: number;
  failureCount: number;
  status: FcmSendStatus;
  /**
   * 재발송 가능한 인원 수. 끝내 전달하지 못한 회원만 센다.
   * 0이면 재시도해도 보낼 대상이 없다(성공했거나, 실패 기록이 남기 이전의 과거 발송).
   */
  retryableCount: number;
  /** 관리자가 수동 재발송한 횟수. */
  retryCount: number;
  /** 마지막 재발송 시각. 재발송한 적 없으면 null. */
  lastRetriedAt: string | null;
}

/** 재발송을 걸 수 있는 상태. 발송이 진행 중인 건은 어디까지 나갔는지 몰라 제외한다. */
export const RETRYABLE_FCM_STATUSES: FcmSendStatus[] = [
  "FAILED",
  "PARTIAL_FAILURE",
  "ABANDONED",
];

export const canRetryFcmMessage = (log: FcmAdminLogData): boolean =>
  RETRYABLE_FCM_STATUSES.includes(log.status) && log.retryableCount > 0;

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
