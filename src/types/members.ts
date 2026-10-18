export interface TokenInfo {
  accessToken: string;
  accessTokenExpiredTime: string;
  refreshToken: string;
  refreshTokenExpiredTime: string;
}

export interface UserInfoInput {
  id?: number | null;
  nickname?: string | null;
  department?: string | null;
  departmentCode?: string | null;
  studentId?: string | null;
  fireId?: number | null;
  role?: string | null;
  chatPushEnabled?: boolean | null;
  nearbyVisibility?: boolean | null;
  /** 실명(PRD v3.4 FR-090). 서버 반영 전에는 내려오지 않는다 */
  realName?: string | null;
  /** 닉네임이 학번 그대로이고 실명이 없으면 true. 조건은 서버가 계산한다 */
  needsRealName?: boolean | null;
}

export interface UserInfo {
  id: number;
  nickname: string;
  department: string; //학과 정보
  departmentCode: string;
  studentId: string; // 학번 "20YYxxxxx" — 앞 4자리가 입학연도
  fireId: number;
  role: string; // "admin" | ""
  chatPushEnabled: boolean;
  nearbyVisibility: boolean;
  /** 실명. 없으면 빈 문자열 */
  realName: string;
  needsRealName: boolean;
}

export type RealNameSource = "MANUAL" | "PORTAL_SCRAPE";

/** PUT /api/members — 실명 저장·삭제 (API v3.4 3-13, 서버는 기존 PUT을 확장) */
export interface UpdateRealNameRequest {
  /** 2~30자, 한글·영문·공백. 빈 문자열이면 삭제(동의 철회) */
  realName: string;
  /** 실명을 넣을 때 필수. 지울 때는 생략 */
  realNameSource?: RealNameSource;
  /** PORTAL_SCRAPE일 때 필수 */
  consentTermsVersion?: string;
}

export interface MembersReplies {
  id: number;
  title: string;
  replyCount: number;
  content: string;
  like: number;
  postId: number;
  createDate: string;
  modifiedDate: string;
}

//알림
export interface Notification {
  memberFcmMessageId?: number;
  fcmMessageId: number;
  memberId: number;
  title: string;
  body: string;
  type:
    | "GENERAL"
    | "DEPARTMENT"
    | "SCHOOL_NOTICE"
    | "CHAT"
    | "FRIEND"
    | "DAILY_BRIEF_TIMETABLE"
    | "DAILY_BRIEF_SCHEDULE"
    | string;
  targetId?: number; // 게시글 ID, 채팅방 ID 등
  // 푸시 payload의 data.path와 같은 값. 포털 내부 경로이거나 외부 링크이며,
  // path 없이 발송된 알림(과거 이력 포함)에는 없다. utils/notificationTarget 참고.
  path?: string | null;
  createDate: string;
  isRead?: boolean;
}

//api로그
export interface ApiLog {
  uri: string;
}

export type FriendStatus = "NONE" | "PENDING" | "RECEIVED" | "ACCEPTED";

export interface MemberProfileResponseDto {
  memberId: number;
  nickname: string;
  fireId: number;
  department: string;
  maskedStudentId: string;
  friendStatus: FriendStatus;
  friendId: number | null;
  friendAlias: string | null;
}
