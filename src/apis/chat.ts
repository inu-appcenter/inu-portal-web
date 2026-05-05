import tokenInstance from "./tokenInstance";
import {
  CreateChatRoomRequest,
  CreateChatRoomResponse,
  JoinChatRoomResponse,
  GetChatRoomResponse,
  GetPreviousChatMessagesResponse,
  ChatMessage, // ChatMessage 타입 추가
  GetPublicChatMessagesResponse, // GetPublicChatMessagesResponse 타입 추가
} from "@/types/chat";
import axiosInstance from "@/apis/axiosInstance";

// 채팅방 생성
export const createChatRoom = async (
  title: string,
  maxCapacity: number,
  isAnonymous: boolean,
): Promise<CreateChatRoomResponse> => {
  const response = await tokenInstance.post<CreateChatRoomResponse>(
    "/api/chat-rooms",
    {
      title,
      maxCapacity,
      isAnonymous,
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

// 채팅방 초기 메시지 로드
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

// 이미지 포함 채팅 메시지 전송
export const sendImageMessage = async (
  roomId: number,
  content: string,
  isAnonymous: boolean,
  imageFiles: File[], // 변경: 단일 파일에서 파일 배열로
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
          imageCount: imageFiles.length, // 변경: 파일 배열의 길이로 설정
        }),
      ],
      { type: "application/json" },
    ),
  );

  // 변경: 각 이미지 파일을 'images' 이름으로 개별적으로 추가
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
