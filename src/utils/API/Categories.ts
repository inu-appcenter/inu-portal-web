// utils/API/Categories.ts - 카테고리 API
import apiClient from './apiClient';

// 모든 카테고리 가져오기
export const getCategories = async () => {
  return await apiClient('https://portal.inuappcenter.kr/api/categories', 'GET', '');
};
