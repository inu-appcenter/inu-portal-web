export interface MemberLogData {
  memberCount: number;
  memberIds: string[];
}

export interface ApiLogData {
  method: string;
  uri: string;
  apiCount: number;
}

// 관리자 FCM 로그 데이터 인터페이스
export interface FcmAdminLogData {
  id: number;
  title: string;
  body: string;
  sendCount: number;
}

// 알림 전송 요청 데이터 인터페이스
export interface FcmSendRequest {
  memberIds: number[];
  title: string;
  content: string;
}

// 관리자 FCM 로그 데이터 인터페이스
export interface FcmAdminLogData {
  id: number;
  title: string;
  body: string;
  sendCount: number;
}

// 알림 전송 요청 데이터 인터페이스
export interface FcmSendRequest {
  memberIds: number[];
  title: string;
  content: string;
}