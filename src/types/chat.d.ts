// src/types/chat.d.ts

/**
 * 채팅 메시지
 */
export interface ChatMessage {
  messageId: number;
  roomId?: number;
  senderNickname: string;
  senderHash?: string;
  content: string;
  createDate: string; // ISO 8601 날짜 문자열
}

/**
 * 채팅방
 */
export interface ChatRoom {
  id: number;
  title: string;
  maxCapacity: number;
  currentParticipants: number;
  createDate: string; // ISO 8601 날짜 문자열
  myHash: string;
  messages: ChatMessage[];
  anonymous: boolean;
}

/**
 * 채팅방 생성 요청
 * POST /api/chat-rooms
 */
export interface CreateChatRoomRequest {
  title: string;
  maxCapacity: number;
  isAnonymous: boolean;
}

/**
 * 채팅방 생성 응답
 * POST /api/chat-rooms (201)
 */
export type CreateChatRoomResponse = ChatRoom;

/**
 * 채팅방 참여 응답
 * POST /api/chat-rooms/{roomId}/join (200)
 */
export type JoinChatRoomResponse = ChatRoom;

/**
 * 채팅방 정보 및 메시지 조회 응답
 * GET /api/chat-rooms/{roomId} (200)
 */
export type GetChatRoomResponse = ChatRoom;

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
export type GetPublicChatMessagesResponse = PublicChatMessage[];

/**
 * 공통 에러 응답 구조
 */
export interface ErrorResponse<T = any> {
  data: T;
  msg: string;
}
