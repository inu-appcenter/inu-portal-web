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

/**
 * 댓글 신고하기
 *
 * 백엔드에 댓글 전용 신고 엔드포인트가 아직 없어, 댓글이 달린 게시글의 신고
 * 엔드포인트로 접수하고 대상 댓글을 상세 내용 앞에 표기한다.
 * 댓글 신고 API(`POST /api/reports/replies/{replyId}` 등)가 생기면 이 함수만 교체하면 된다.
 */
export const postReplyReport = async (
  postId: number,
  replyId: number,
  reason: string,
  comment: string,
): Promise<ApiResponse<number>> => {
  const detail = comment.trim();
  return postReports(
    postId,
    reason,
    `[댓글 신고 replyId=${replyId}]${detail ? ` ${detail}` : ""}`,
  );
};
