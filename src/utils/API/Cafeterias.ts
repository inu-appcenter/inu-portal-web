// utils/API/Cafeterias.ts - 학식 API
import apiClient from './apiClient';

// 학식 메뉴 가져오기
export const getCafeterias = async (cafeteria: string,day:number) => {
  const apiURL = `https://portal.inuappcenter.kr/api/cafeterias?cafeteria=${cafeteria}&day=${day}`;
  return await apiClient(apiURL, 'GET', '');
};
