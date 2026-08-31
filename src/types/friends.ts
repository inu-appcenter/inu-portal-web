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
  department?: string;
}

/**
 * 내 친구추가 초대 코드
 * (inu-appcenter/inu-portal-server#330, GET /api/friends/invite-code)
 *
 * url은 서버 설정 기준으로 조립된 정규 링크다. 배포 환경(운영 / test.pages.dev)에 따라
 * 공유 링크가 달라져야 하므로 화면에서는 code로 현재 origin 기준 링크를 직접 만든다.
 */
export interface FriendInviteCodeResponseDto {
  code: string;
  url: string;
}

/**
 * 친구추가 링크 미리보기 - 링크 주인 정보
 * (inu-appcenter/inu-portal-server#330, GET /api/friends/invite/{code})
 *
 * 비로그인 상태에서도 조회되는 응답이라 학번은 마스킹된 값만 담긴다.
 */
export interface FriendInvitePreviewResponseDto {
  nickname: string;
  studentId: string;
  fireId: number;
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
