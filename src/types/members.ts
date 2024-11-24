export interface TokenInfo {
  accessToken: string;
  accessTokenExpiredTime: string;
  refreshToken: string;
  refreshTokenExpiredTime: string;
}

export interface UserInfo {
  id: number;
  nickname: string;
  fireId: number;
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
