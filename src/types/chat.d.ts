// src/types/chat.d.ts

/**
 * 채팅방 종류
 */
export type ChatRoomType = "PERSONAL" | "OPEN";

/**
 * 채팅방 상태
 */
export type ChatRoomStatus = "ACTIVE" | "CLOSED";

/**
 * 채팅 메시지
 */
export interface ChatMessage {
  messageId: number;
  roomId: number;
  senderNickname: string;
  senderAlias: string | null;
  senderId: number | null;
  senderHash: string;
  content: string;
  imageCount: number;
  unreadCount: number;
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
  memberId: number | null;
  nickname: string;
  studentId: string | null;
  fireId: number | null;
  me: boolean;
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
  messageId: number;
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
