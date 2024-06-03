// getNotices.tsx
import apiClient from '../apiClient';

const getNotices = async (category: string, sort: string, page: string) => {
  const apiURL = category === '전체'
    ? `https://portal.inuappcenter.kr/api/notices?sort=${sort}&page=${page}`
    : `https://portal.inuappcenter.kr/api/notices?category=${category}&sort=${sort}&page=${page}`;
  try {
    const data = await apiClient(apiURL, 'GET', '');
    return data.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export default getNotices;
