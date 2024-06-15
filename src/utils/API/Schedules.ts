// utils/API/Schedules.ts - 학사일정 API
import apiClient from './apiClient';

// 학사일정 가져오기
export const getSchedules = async (year: number, month: number) => {
  const apiURL = `https://portal.inuappcenter.kr/api/schedules?year=${year}&month=${month}`;
  return await apiClient(apiURL, 'GET', '');
};