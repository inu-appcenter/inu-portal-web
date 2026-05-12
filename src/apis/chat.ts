import tokenInstance from "./tokenInstance";
import {
  CreateChatRoomRequest,
  CreateChatRoomResponse,
  JoinChatRoomResponse,
  GetChatRoomResponse,
  GetPreviousChatMessagesResponse,
  ChatMessage,
  GetPublicChatMessagesResponse,
  ChatRoomType,
  MyChatRoomResponseDto,
  UnreadTotalCountResponseDto,
  ChatRoomMemberResponseDto,
} from "@/types/chat";
import axiosInstance from "@/apis/axiosInstance";
import { ApiResponse } from "@/types/common";

// 채팅방 생성
export const createChatRoom = async (
  title: string,
  maxCapacity: number,
  isAnonymous: boolean,
  type: ChatRoomType,
): Promise<CreateChatRoomResponse> => {
  const response = await tokenInstance.post<CreateChatRoomResponse>(
    "/api/chat-rooms",
    {
      title,
      maxCapacity,
      isAnonymous,
      type,
    } as CreateChatRoomRequest,
  );
  return response.data;
};

// 채팅방 참여
export const joinChatRoom = async (
  roomId: string | number,
): Promise<JoinChatRoomResponse> => {
  const response = await tokenInstance.post<JoinChatRoomResponse>(
    `/api/chat-rooms/${roomId}/join`,
  );
  return response.data;
};

// 채팅방 정보 및 초기 메시지 로드
export const getChatMessages = async (
  roomId: string | number,
): Promise<GetChatRoomResponse> => {
  const response = await tokenInstance.get<GetChatRoomResponse>(
    `/api/chat-rooms/${roomId}`,
  );
  return response.data;
};

// 이전 채팅 메시지 로드
export const getPreviousMessages = async (
  roomId: string | number,
  lastId: number,
): Promise<GetPreviousChatMessagesResponse> => {
  const response = await tokenInstance.get<GetPreviousChatMessagesResponse>(
    `/api/chat-rooms/${roomId}/messages`,
    {
      params: { lastId },
    },
  );
  return response.data;
};

// 내가 참여 중인 채팅방 목록 조회
export const getMyChatRooms = async (): Promise<
  ApiResponse<MyChatRoomResponseDto[]>
> => {
  const response = await tokenInstance.get<
    ApiResponse<MyChatRoomResponseDto[]>
  >("/api/chat-rooms/my");
  return response.data;
};

// 안 읽은 메시지 총합 조회
export const getUnreadTotalCount = async (): Promise<
  ApiResponse<UnreadTotalCountResponseDto>
> => {
  const response = await tokenInstance.get<
    ApiResponse<UnreadTotalCountResponseDto>
  >("/api/chat-rooms/unread-total-count");
  return response.data;
};

// 채팅방 나가기
export const leaveChatRoom = async (
  roomId: string | number,
): Promise<ApiResponse<void>> => {
  const response = await tokenInstance.delete<ApiResponse<void>>(
    `/api/chat-rooms/${roomId}/leave`,
  );
  return response.data;
};

// 오픈채팅방 폐쇄
export const closeChatRoom = async (
  roomId: string | number,
): Promise<ApiResponse<void>> => {
  const response = await tokenInstance.patch<ApiResponse<void>>(
    `/api/chat-rooms/${roomId}/close`,
  );
  return response.data;
};

// 채팅방 멤버 목록 조회
export const getChatRoomMembers = async (
  roomId: string | number,
): Promise<ApiResponse<ChatRoomMemberResponseDto[]>> => {
  const response = await tokenInstance.get<
    ApiResponse<ChatRoomMemberResponseDto[]>
  >(`/api/chat-rooms/${roomId}/members`);
  return response.data;
};

// 이미지 포함 채팅 메시지 전송
export const sendImageMessage = async (
  roomId: number,
  content: string,
  isAnonymous: boolean,
  imageFiles: File[],
): Promise<ChatMessage> => {
  const formData = new FormData();
  formData.append(
    "messageDto",
    new Blob(
      [
        JSON.stringify({
          roomId,
          content,
          isAnonymous,
          imageCount: imageFiles.length,
        }),
      ],
      { type: "application/json" },
    ),
  );

  imageFiles.forEach((file) => {
    formData.append("images", file);
  });

  const response = await tokenInstance.post<ChatMessage>(
    "/api/chat/messages",
    formData,
  );
  return response.data;
};

// 채팅방 최신 메시지 2개 조회 (Public)
export const getPublicChatMessages = async (
  roomId: number,
): Promise<GetPublicChatMessagesResponse> => {
  const response = await axiosInstance.get<GetPublicChatMessagesResponse>(
    `/api/chat-rooms/${roomId}/messages/public`,
  );
  return response.data;
};

/**
 * 개인 채팅방 생성
 * targetMemberIds: 나를 제외한 상대방들의 memberId 리스트
 */
export const createPersonalChatRoom = async (
  targetMemberIds: number[],
  isAdminMode: boolean = false,
  title?: string,
): Promise<CreateChatRoomResponse> => {
  const response = await tokenInstance.post<CreateChatRoomResponse>(
    "/api/chat-rooms/personal",
    { targetMemberIds, isAdminMode, title },
  );
  return response.data;
};

/**
 * 채팅방 이름 변경
 * PATCH /api/chat-rooms/{roomId}/title
 */
export const updateChatRoomTitle = async (
  roomId: number,
  title: string,
): Promise<ApiResponse<void>> => {
  const response = await tokenInstance.patch<ApiResponse<void>>(
    `/api/chat-rooms/${roomId}/title`,
    { title },
  );
  return response.data;
};

/**
 * 채팅방 삭제 (관리자 전용)
 * DELETE /api/chat-rooms/{roomId}
 */
export const deleteChatRoom = async (
  roomId: number,
): Promise<ApiResponse<void>> => {
  const response = await tokenInstance.delete<ApiResponse<void>>(
    `/api/chat-rooms/${roomId}`,
  );
  return response.data;
};
