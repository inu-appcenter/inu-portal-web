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
    | string;
  targetId?: number; // 게시글 ID, 채팅방 ID 등
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
