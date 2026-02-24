import tokenInstance from "@/apis/tokenInstance";
import { ApiResponse } from "@/types/common";

// 신고하기
export const postReports = async (
  postId: number,
  reason: string,
  comment: string,
): Promise<ApiResponse<number>> => {
  const response = await tokenInstance.post<ApiResponse<number>>(
    `/api/reports/${postId}`,
    { reason, comment },
  );
  return response.data;
};
