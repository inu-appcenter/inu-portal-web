// utils/API/Images.ts - 횃불이 이미지 API
import apiClient from './apiClient';

// 횃불이 이미지 가져오기
export const getFireImages = async (token: string, fireId: number) => {
  const apiURL = `https://portal.inuappcenter.kr/api/images/${fireId}`;
  return await apiClient(apiURL, 'GET', token, undefined, 'url');
};
