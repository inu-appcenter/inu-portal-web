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
 * 게시글 작성자 차단 (postId 기준).
 *
 * PostResponseDto/PostListResponseDto는 memberId를 내려주지 않는다(익명 글 재식별
 * 방지, server 확인 완료 — /v3/api-docs 스키마에 memberId 필드 자체가 없음). 그래서
 * blockUser(memberId)는 애초에 호출할 수 없었다 - 게시글 작성자 차단 버튼이 있어도
 * 항상 조용히 실패(또는 아예 노출 안 됨)하던 상태였다. postId만으로 서버가 작성자를
 * 찾아 차단하는 이 엔드포인트를 대신 쓴다.
 */
export const blockPostAuthor = async (
  postId: number,
): Promise<ApiResponse<void>> => {
  const response = await tokenInstance.post<ApiResponse<void>>(
    `/api/blocks/by-post/${postId}`,
  );
  return response.data;
};

/**
 * 댓글/대댓글 작성자 차단 (replyId 기준). blockPostAuthor와 같은 이유로 필요하다 —
 * ReplyResponseDto/ReReplyResponseDto에도 memberId가 없다.
 */
export const blockReplyAuthor = async (
  replyId: number,
): Promise<ApiResponse<void>> => {
  const response = await tokenInstance.post<ApiResponse<void>>(
    `/api/blocks/by-reply/${replyId}`,
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
