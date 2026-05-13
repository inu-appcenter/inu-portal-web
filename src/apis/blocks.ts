import tokenInstance from "./tokenInstance";
import { BlockResponseDto } from "@/types/blocks";
import { ApiResponse } from "@/types/common";

/**
 * 특정 유저 차단
 */
export const blockUser = async (
  targetMemberId: number,
): Promise<ApiResponse<void>> => {
  const response = await tokenInstance.post<ApiResponse<void>>(
    `/api/blocks/${targetMemberId}`,
  );
  return response.data;
};

/**
 * 차단 해제
 */
export const unblockUser = async (
  targetMemberId: number,
): Promise<ApiResponse<void>> => {
  const response = await tokenInstance.delete<ApiResponse<void>>(
    `/api/blocks/${targetMemberId}`,
  );
  return response.data;
};

/**
 * 차단 유저 목록 조회
 */
export const getBlockedUsers = async (): Promise<
  ApiResponse<BlockResponseDto[]>
> => {
  const response = await tokenInstance.get<ApiResponse<BlockResponseDto[]>>(
    "/api/blocks",
  );
  return response.data;
};
