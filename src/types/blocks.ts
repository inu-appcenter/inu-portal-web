// src/types/blocks.ts

/**
 * 차단 응답 DTO
 */
export interface BlockResponseDto {
  blockId: number;
  blockedMemberId: number;
  nickname: string;
  studentId: string;
}
