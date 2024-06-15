// utils/API/Weathers.ts - 날씨 API
import apiClient from './apiClient';

// 날씨 가져오기
export const getWeathers = async () => {
  const apiURL = `https://portal.inuappcenter.kr/api/weathers`;
  return await apiClient(apiURL, 'GET', '');
};
