import tokenInstance from "./tokenInstance";
import {
  FriendRequestDto,
  FriendResponseDto,
  MemberLocationRequestDto,
  NearbyMemberResponseDto,
  NearbyVisibilityRequestDto,
} from "@/types/friends";
import { ApiResponse } from "@/types/common";
import { MemberProfileResponseDto } from "@/types/members";
import { isMockApiEnabled, mockDelay } from "@/mocks/mockFlag";
import { getMockNearbyFriends } from "@/mocks/mockNearbyFriends";

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

/**
 * 친구의 상세 프로필 정보 조회
 */
export const getFriendProfile = async (
  friendId: number,
): Promise<ApiResponse<MemberProfileResponseDto>> => {
  const response = await tokenInstance.get<ApiResponse<MemberProfileResponseDto>>(
    `/api/friends/${friendId}/profile`,
  );
  return response.data;
};

/**
 * 주변 친구 찾기 - 위치 노출 on/off (opt-in)
 * 서버 API 없음, 요청 필요: inu-appcenter/inu-portal-server#302
 */
export const updateNearbyVisibility = async (
  enabled: boolean,
): Promise<ApiResponse<void>> => {
  if (isMockApiEnabled()) {
    await mockDelay();
    return { result: [], data: undefined, msg: "주변 친구 찾기 노출 설정이 변경되었습니다." };
  }
  const response = await tokenInstance.patch<ApiResponse<void>>(
    "/api/members/nearby-visibility",
    { enabled } as NearbyVisibilityRequestDto,
  );
  return response.data;
};

/**
 * 주변 친구 찾기 - 내 위치 갱신
 * 서버 API 없음, 요청 필요: inu-appcenter/inu-portal-server#302
 */
export const updateMyLocation = async (
  latitude: number,
  longitude: number,
): Promise<ApiResponse<void>> => {
  if (isMockApiEnabled()) {
    await mockDelay();
    return { result: [], data: undefined, msg: "위치 정보가 갱신되었습니다." };
  }
  const response = await tokenInstance.put<ApiResponse<void>>(
    "/api/members/location",
    { latitude, longitude } as MemberLocationRequestDto,
  );
  return response.data;
};

/**
 * 주변 친구 찾기 - 반경 내 위치 노출 중인 유저 조회
 * 서버 API 없음, 요청 필요: inu-appcenter/inu-portal-server#302
 */
export const getNearbyFriends = async (
  latitude: number,
  longitude: number,
  radiusMeters: number = 200,
): Promise<ApiResponse<NearbyMemberResponseDto[]>> => {
  if (isMockApiEnabled()) {
    await mockDelay();
    return {
      result: [],
      data: getMockNearbyFriends(latitude, longitude, radiusMeters),
      msg: "주변 친구 후보 조회 성공",
    };
  }
  const response = await tokenInstance.get<ApiResponse<NearbyMemberResponseDto[]>>(
    "/api/friends/nearby",
    { params: { latitude, longitude, radiusMeters } },
  );
  return response.data;
};
