// utils/API/Notices.ts - 학교 공지사항 API
import apiClient from './apiClient';

// 모든 공지사항 가져오기
export const getNotices = async (category: string, sort: string, page: string) => {
  const apiURL = category === '전체'
    ? `https://portal.inuappcenter.kr/api/notices?sort=${sort}&page=${page}`
    : `https://portal.inuappcenter.kr/api/notices?category=${category}&sort=${sort}&page=${page}`;
  return await apiClient(apiURL, 'GET', '');
};

// 상단부 인기 공지 12개 가져오기
export const getNoticesTop = async () => {
  const apiURL = `https://portal.inuappcenter.kr/api/notices/top`;
  return await apiClient(apiURL, 'GET', '');
};
