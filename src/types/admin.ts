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
  /**
   * 아래 5개는 클릭율 집계 필드다. 서버(read_source 컬럼 마이그레이션 + 배포)가
   * 나가기 전 응답에는 아예 없으므로 optional로 둔다. 배포가 끝나면 필수로 좁혀도 된다.
   * 재발송 직후 값은 상세 GET으로 다시 읽는 편이 정확하다(POST 응답에도 집계는 실린다).
   */
  /** 알림함 행이 생긴 수신 "회원" 수. 클릭율의 분모. 기기 단위인 targetCount와 다르다. */
  recipientCount?: number;
  /** 읽음 처리된 수. 전체 읽음·조회수 기반 자동 읽음도 포함하므로 clickCount보다 크거나 같다. */
  readCount?: number;
  /** pushReadCount + inboxReadCount. 클릭율의 분자. */
  clickCount?: number;
  /** 푸시를 직접 눌러서 연 수. */
  pushReadCount?: number;
  /** 알림함에서 개별 알림을 눌러서 연 수. */
  inboxReadCount?: number;
}

/**
 * 클릭율(%). 분모는 반드시 recipientCount(회원 단위)다. targetCount/sendCount는
 * 토큰(기기) 단위라 기기를 여러 대 쓰는 회원 때문에 전환율이 낮게 나온다.
 * 집계 필드가 없거나 수신 인원이 0이면 계산하지 않고 null을 준다(호출부에서 "-" 표시).
 */
export const getFcmClickRate = (log: FcmAdminLogData): number | null => {
  const recipientCount = log.recipientCount ?? 0;
  if (!recipientCount) return null;
  return ((log.clickCount ?? 0) / recipientCount) * 100;
};

/** 집계 도입(read_source 컬럼) 이전에 이미 읽힌 과거 발송. 버그가 아니라 데이터 부재다. */
export const isFcmClickStatUnavailable = (log: FcmAdminLogData): boolean =>
  (log.readCount ?? 0) > 0 && (log.clickCount ?? 0) === 0;

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
