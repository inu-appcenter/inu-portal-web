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