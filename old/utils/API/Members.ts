// utils/API/Members.ts - 회원 API
import apiClient from './apiClient';
import refreshClient from './refreshClient';

// 회원 가져오기
export const getMembers = async (token: string) => {
  return await apiClient('https://portal.inuappcenter.kr/api/members', 'GET', token);
};

// 회원 삭제
export const deleteMembers = async (token: string) => {
  return await apiClient('https://portal.inuappcenter.kr/api/members', 'DELETE', token);
};

// 토큰 재발급
export const refresh = async (refreshToken: string) => {
  return await refreshClient('https://portal.inuappcenter.kr/api/members/refresh', 'POST', refreshToken);
};

// 회원 닉네임/횃불이 이미지 변경
export const putMembers = async (token: string, nickname: string, fireId: string) => {
  const data: { nickname?: string; fireId?: string } = {};
  if (nickname) data.nickname = nickname;
  if (fireId) data.fireId = fireId;

  return await apiClient('https://portal.inuappcenter.kr/api/members', 'PUT', token, data);
};

// 로그인
export const login = async (data: { studentId: string; password: string }) => {
  return await apiClient('https://portal.inuappcenter.kr/api/members/login', 'POST', '', data);
};

// 회원이 스크랩한 모든 글 가져오기
export const getMembersScraps = async (token: string, sort: string, page: number) => {
  const apiURL = `https://portal.inuappcenter.kr/api/members/scraps?sort=${sort}&page=${page}`;
  return await apiClient(apiURL, 'GET', token);
};

// 회원이 작성한 모든 댓글 가져오기
export const getMembersReplies = async (token: string, sort: string) => {
  const apiURL = sort === 'date' ? `https://portal.inuappcenter.kr/api/members/replies` : `https://portal.inuappcenter.kr/api/members/replies?sort=${sort}`;
  return await apiClient(apiURL, 'GET', token);
};

// 회원이 작성한 모든 글 가져오기
export const getMembersPosts = async (token: string, sort: string) => {
  const apiURL = sort === 'date' ? `https://portal.inuappcenter.kr/api/members/posts` : `https://portal.inuappcenter.kr/api/members/posts?sort=${sort}`;
  return await apiClient(apiURL, 'GET', token);
};


// 회원이 좋아요한 모든 글 가져오기
export const getMembersLikes = async (token: string, sort: string) => {
  const apiURL = sort === 'date' ? `https://portal.inuappcenter.kr/api/members/likes` : `https://portal.inuappcenter.kr/api/members/likes?sort=${sort}`;
  return await apiClient(apiURL, 'GET', token);
};
