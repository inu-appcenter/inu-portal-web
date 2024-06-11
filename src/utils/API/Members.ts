// utils/API/Members.ts - 회원 API
import apiClient from './apiClient';

// 회원 가져오기
export const getMembers = async (token: string) => {
  return await apiClient('https://portal.inuappcenter.kr/api/members', 'GET', token);
};

// 회원 닉네임/횃불이 이미지 변경
export const putMembers = async (token: string, nickname: string, fireId: string) => {
  const data = { nickname, fireId };
  return await apiClient('https://portal.inuappcenter.kr/api/members', 'PUT', token, data);
};

// 회원 삭제
export const deleteMembers = async (token: string) => {
  return await apiClient('https://portal.inuappcenter.kr/api/members', 'DELETE', token);
};

// 토큰 재발급
export const refresh = async (refreshToken: string) => {
  return await apiClient('https://portal.inuappcenter.kr/api/members/refresh', 'POST', refreshToken, undefined);
};