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
  fireId?: number | null;
  role?: string | null;
}

export interface UserInfo {
  id: number;
  nickname: string;
  department: string; //학과 정보
  fireId: number;
  role: string; // "admin" | ""
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
}

//api로그
export interface ApiLog {
  uri: string;
}
