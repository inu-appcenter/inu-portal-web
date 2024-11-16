import tokenInstance from "apis/tokenInstance";
import { ApiResponse } from "types/common";

// 댓글 수정
export const putReply = async (
  replyId: number,
  content: string,
  anonymous: boolean
): Promise<ApiResponse<number>> => {
  const response = await tokenInstance.put<ApiResponse<number>>(
    `/api/replies/${replyId}`,
    { content, anonymous }
  );
  return response.data;
};

// 댓글 삭제
export const deleteReply = async (
  replyId: number
): Promise<ApiResponse<number>> => {
  const response = await tokenInstance.delete<ApiResponse<number>>(
    `/api/replies/${replyId}`
  );
  return response.data;
};

// 댓글 좋아요 여부 변경
export const putReplyLike = async (
  replyId: number
): Promise<ApiResponse<number>> => {
  const response = await tokenInstance.put<ApiResponse<number>>(
    `/api/replies/${replyId}/like`
  );
  return response.data;
};

// 대댓글 등록
export const postReReply = async (
  replyId: number,
  content: string,
  anonymous: boolean
): Promise<ApiResponse<number>> => {
  const response = await tokenInstance.post<ApiResponse<number>>(
    `/api/replies/${replyId}/re-replies`,
    { content, anonymous }
  );
  return response.data;
};

// 댓글 등록
export const postReply = async (
  postId: number,
  content: string,
  anonymous: boolean
): Promise<ApiResponse<number>> => {
  const response = await tokenInstance.post<ApiResponse<number>>(
    `/api/replies/${postId}`,
    { content, anonymous }
  );
  return response.data;
};
