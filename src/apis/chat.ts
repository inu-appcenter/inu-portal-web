import tokenInstance from "./tokenInstance";
import {
  CreateChatRoomRequest,
  CreateChatRoomResponse,
  JoinChatRoomResponse,
  GetChatRoomResponse,
} from "@/types/chat";

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
