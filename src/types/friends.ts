// src/types/friends.ts

/**
 * 친구 요청 DTO
 */
export interface FriendRequestDto {
  studentId?: string;
  nickname?: string;
}

/**
 * 친구 응답 DTO
 */
export interface FriendResponseDto {
  friendId: number;
  friendMemberId: number;
  nickname: string;
  studentId: string;
  fireId: number;
  friendAlias?: string;
}

/**
 * 주변 친구 찾기 - 위치 노출 on/off 요청 DTO
 * (inu-appcenter/inu-portal-server#302, PATCH /api/members/nearby-visibility)
 */
export interface NearbyVisibilityRequestDto {
  enabled: boolean;
}

/**
 * 주변 친구 찾기 - 내 위치 갱신 요청 DTO
 * (inu-appcenter/inu-portal-server#302, PUT /api/members/location)
 */
export interface MemberLocationRequestDto {
  latitude: number;
  longitude: number;
}

/**
 * 주변 친구 찾기 - 반경 내 후보 응답 DTO
 * (inu-appcenter/inu-portal-server#302, GET /api/friends/nearby)
 */
export interface NearbyMemberResponseDto {
  memberId: number;
  nickname: string;
  studentId: string;
  fireId: number;
  distanceMeters: number;
}
