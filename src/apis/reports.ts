import tokenInstance from "@/apis/tokenInstance";
import { ApiResponse } from "@/types/common";
import { SUPPORT_EMAIL } from "@/constants/support";

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

/**
 * 채팅 메시지 신고하기
 *
 * 서버에 채팅 전용 신고 엔드포인트가 아직 없다(2026-08 기준 /v3/api-docs에
 * /api/reports/{postId} 하나뿐). 엔드포인트가 배포되면 클라이언트를 고치지
 * 않아도 바로 붙도록 규격을 먼저 호출해 두고, 없을 때(404/405)는 호출부가
 * 문의 채널 폴백으로 넘어갈 수 있게 `ChatReportUnavailableError`를 던진다.
 *
 * 서버 작업 필요: POST /api/reports/chat-messages/{messageId}
 *   body { roomId, reason, comment }
 */
export class ChatReportUnavailableError extends Error {
  constructor() {
    super("채팅 신고 엔드포인트가 아직 배포되지 않았습니다.");
    this.name = "ChatReportUnavailableError";
  }
}

export const reportChatMessage = async (
  roomId: string,
  messageId: string,
  reason: string,
  comment: string,
): Promise<ApiResponse<number>> => {
  try {
    const response = await tokenInstance.post<ApiResponse<number>>(
      `/api/reports/chat-messages/${messageId}`,
      { roomId, reason, comment: comment.trim() },
    );
    return response.data;
  } catch (error) {
    const status = (error as { response?: { status?: number } })?.response
      ?.status;
    // 404/405는 "그런 메시지가 없다"가 아니라 "그런 라우트가 없다"에 가깝다 —
    // 라우트가 생기기 전까지는 폴백으로 넘긴다.
    if (status === 404 || status === 405 || status === 501) {
      throw new ChatReportUnavailableError();
    }
    throw error;
  }
};

/**
 * 채팅 신고 폴백 링크 — 서버 엔드포인트가 붙기 전까지 쓰는 임시 접수 채널.
 * 신고 대상을 운영자가 특정할 수 있도록 방/메시지 식별자를 본문에 채워 준다.
 */
export const buildChatReportFallbackUrl = (params: {
  roomId: string;
  messageId: string;
  senderNickname: string;
  reason: string;
  comment: string;
}): string => {
  const body = [
    "[INTIP 채팅 신고]",
    `- 채팅방 ID: ${params.roomId}`,
    `- 메시지 ID: ${params.messageId}`,
    `- 작성자: ${params.senderNickname}`,
    `- 신고 사유: ${params.reason}`,
    `- 상세 내용: ${params.comment.trim() || "(없음)"}`,
    "",
    "운영자가 24시간 이내에 확인 후 조치합니다.",
  ].join("\n");

  return `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
    "[INTIP] 채팅 신고 접수",
  )}&body=${encodeURIComponent(body)}`;
};
