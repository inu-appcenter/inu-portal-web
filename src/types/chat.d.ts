// src/types/chat.d.ts

/**
 * 채팅방 종류
 */
export type ChatRoomType = "PERSONAL" | "OPEN";

/**
 * 채팅방 상태
 */
export type ChatRoomStatus = "ACTIVE" | "CLOSED";

export type MessageType =
  | "TEXT"
  | "IMAGE"
  | "TIMETABLE_SHARE"
  | "BOT_QUESTION"
  | "BOT_ANSWER";


export interface TimetableShareTimeSlot {
  day: number;
  startTime: number;
  endTime: number;
  duration: number;
}

export interface TimetableShareExtraData {
  title?: string;
  /** @deprecated 기존 메시지 호환용 Friend 관계 ID */
  friendIds: number[];
  /** 공유 참여자의 Member ID */
  memberIds?: number[];
  topFreeTimes: TimetableShareTimeSlot[];
}

/**
 * 채팅 메시지
 */
export interface ChatMessage {
  /**
   * 18자리 스노우플레이크라 Number로 담을 수 없어(MAX_SAFE_INTEGER는 16자리)
   * 서버가 문자열로 내려준다. Number()로 바꾸면 하위 자릿수가 잘려
   * 서로 다른 메시지가 같은 값이 되므로 문자열 그대로 다뤄야 한다.
   * 대소 비교가 필요하면 `hooks/chat/messageSync`의 `compareMessageIds`를 쓴다.
   */
  messageId: string;
  roomId: string;
  senderNickname: string;
  senderAlias: string | null;
  senderChatRoomMemberId: number;
  senderHash: string;
  content: string;
  imageCount: number;
  unreadCount: number;
  messageType?: MessageType;
  extraData?: string | null;
  createDate: string; // ISO 8601 날짜 문자열
}

/**
 * 채팅방 상세 정보
 */
export interface ChatRoom {
  id: number;
  title: string;
  maxCapacity: number;
  type: ChatRoomType;
  status: ChatRoomStatus;
  currentParticipants: number;
  createDate: string; // ISO 8601 날짜 문자열
  myHash: string;
  messages: ChatMessage[];
  anonymous: boolean;
  owner: boolean;
  isOfficial: boolean;
  pushEnabled: boolean;
  thumbnailUrl: string | null;
  description: string | null;
  friendAlias: string | null;
}

/**
 * 내 채팅방 목록 응답 DTO
 */
export interface MyChatRoomResponseDto {
  roomId: number;
  title: string;
  type: ChatRoomType;
  lastMessage: string;
  lastMessageTime: string; // ISO 8601
  unreadCount: number;
  senderName: string;
  senderProfileImageNumber: number;
  owner: boolean;
  official: boolean;
  currentParticipants: number;
  friendAlias: string | null;
  pushEnabled: boolean;
  thumbnailUrl: string | null;
}

/**
 * 오픈 채팅방 목록 응답 DTO
 */
export interface OpenChatRoomResponseDto {
  roomId: number;
  title: string;
  description: string;
  thumbnailUrl: string | null;
  ownerNickname: string;
  maxCapacity: number;
  currentParticipants: number;
  createDate: string;
  official: boolean;
  anonymous: boolean;
  joined: boolean;
}

/**
 * 채팅방 멤버 응답 DTO
 */
export interface ChatRoomMemberResponseDto {
  chatRoomMemberId: number;
  nickname: string;
  studentId: string | null;
  fireId: number | null;
  isMe: boolean;
  isOwner: boolean;
  friendAlias: string | null;
}

/**
 * 채팅방 정보 수정 요청
 */
export interface UpdateChatRoomInfoRequest {
  title?: string;
  maxCapacity?: number;
  description?: string;
}

/**
 * 안 읽은 메시지 총합 응답 DTO
 */
export interface UnreadTotalCountResponseDto {
  totalUnreadCount: number;
}

/**
 * 채팅방 생성 요청
 * POST /api/chat-rooms
 */
export interface CreateChatRoomRequest {
  title: string;
  maxCapacity: number;
  isAnonymous: boolean;
  type: ChatRoomType;
  description?: string;
}

/**
 * 채팅방 생성 응답
 * POST /api/chat-rooms (201)
 */
export type CreateChatRoomResponse = ApiResponse<ChatRoom>;

/**
 * 채팅방 참여 응답
 * POST /api/chat-rooms/{roomId}/join (200)
 */
export type JoinChatRoomResponse = ApiResponse<ChatRoom>;

/**
 * 채팅방 정보 및 메시지 조회 응답
 * GET /api/chat-rooms/{roomId} (200)
 */
export type GetChatRoomResponse = ApiResponse<ChatRoom>;

/**
 * 이전 채팅 메시지 조회 응답
 * GET /api/chat-rooms/{roomId}/messages?lastId={lastId} (200)
 */
export type GetPreviousChatMessagesResponse = ChatMessage[];

/**
 * 공개 채팅 메시지
 */
export interface PublicChatMessage {
  /** ChatMessage.messageId와 같은 이유로 문자열이다. */
  messageId: string;
  senderNickname: string;
  content: string;
  createDate: string; // ISO 8601 날짜 문자열
}

/**
 * 공개 채팅 메시지 조회 응답
 * GET /api/chat-rooms/{roomId}/messages/public (200)
 */
export interface GetPublicChatMessagesResponse {
  data: PublicChatMessage[];
  msg: string | null;
}
/**
 * 공통 에러 응답 구조
 */
export interface ErrorResponse<T = any> {
  data: T;
  msg: string;
}
