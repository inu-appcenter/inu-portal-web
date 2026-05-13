import tokenInstance from "./tokenInstance";
import { FriendRequestDto, FriendResponseDto } from "@/types/friends";
import { ApiResponse } from "@/types/common";

/**
 * 친구 요청 보내기
 */
export const requestFriend = async (
  nickname: string,
): Promise<ApiResponse<void>> => {
  const response = await tokenInstance.post<ApiResponse<void>>(
    "/api/friends/request",
    { nickname } as FriendRequestDto,
  );
  return response.data;
};


/**
 * 대기 중인 친구 요청 목록 조회
 */
export const getPendingFriends = async (): Promise<
  ApiResponse<FriendResponseDto[]>
> => {
  const response = await tokenInstance.get<ApiResponse<FriendResponseDto[]>>(
    "/api/friends/pending",
  );
  return response.data;
};

/**
 * 친구 요청 수락
 */
export const acceptFriend = async (
  friendId: number,
): Promise<ApiResponse<void>> => {
  const response = await tokenInstance.post<ApiResponse<void>>(
    `/api/friends/${friendId}/accept`,
  );
  return response.data;
};

/**
 * 친구 삭제 또는 요청 거절
 */
export const deleteFriend = async (
  friendId: number,
): Promise<ApiResponse<void>> => {
  const response = await tokenInstance.delete<ApiResponse<void>>(
    `/api/friends/${friendId}`,
  );
  return response.data;
};

/**
 * 수락된 친구 목록 조회
 */
export const getFriends = async (): Promise<
  ApiResponse<FriendResponseDto[]>
> => {
  const response = await tokenInstance.get<ApiResponse<FriendResponseDto[]>>(
    "/api/friends",
  );
  return response.data;
};

/**
 * 내가 보낸 친구 요청 목록 조회
 */
export const getSentPendingFriends = async (): Promise<
  ApiResponse<FriendResponseDto[]>
> => {
  const response = await tokenInstance.get<ApiResponse<FriendResponseDto[]>>(
    "/api/friends/pending/sent",
  );
  return response.data;
};

/**
 * 친구 검색 (신청 전 확인용)
 */
export const searchFriend = async (
  nickname: string,
): Promise<ApiResponse<FriendResponseDto>> => {
  const response = await tokenInstance.get<ApiResponse<FriendResponseDto>>(
    "/api/friends/search",
    { params: { nickname } },
  );
  return response.data;
};

/**
 * 친구 별명 수정
 */
export const updateFriendAlias = async (
  friendId: number,
  alias: string,
): Promise<ApiResponse<void>> => {
  const response = await tokenInstance.patch<ApiResponse<void>>(
    `/api/friends/${friendId}/alias`,
    { alias },
  );
  return response.data;
};
