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
  memberId: number;
  nickname: string;
  studentId: string;
  fireId: number;
}
