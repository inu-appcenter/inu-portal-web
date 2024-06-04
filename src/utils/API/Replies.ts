// utils/API/Replies.ts - 댓글 API
import apiClient from './apiClient';

// 댓글 수정
export const putReplies = async (token: string, replyId: number, content: string, anonymous: boolean) => {
  return await apiClient(`https://portal.inuappcenter.kr/api/replies/${replyId}`, 'PUT', token, { content, anonymous });
};

// 댓글 삭제
export const deleteReplies = async (token: string, replyId: number) => {
  return await apiClient(`https://portal.inuappcenter.kr/api/replies/${replyId}`, 'DELETE', token);
};

// 댓글 좋아요 여부 변경
export const handleRepliesLike = async (token: string, replyId: number) => {
  return await apiClient(`https://portal.inuappcenter.kr/api/replies/${replyId}/like`, 'PUT', token);
};

// 대댓글 등록
export const postReReplies = async (token: string, replyId: number, content: string, anonymous: boolean) => {
  return await apiClient(`https://portal.inuappcenter.kr/api/replies/${replyId}/re-replies`, 'POST', token, { content, anonymous });
};

// 댓글 등록
export const postReplies = async (token: string, postId: string, content: string, anonymous: boolean) => {
  return await apiClient(`https://portal.inuappcenter.kr/api/replies/${postId}`, 'POST', token, { content, anonymous });
};
