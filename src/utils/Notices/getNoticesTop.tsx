// getNoticesTop.tsx
import apiClient from '../apiClient';

const getNoticesTop = async () => {
  const apiURL = `https://portal.inuappcenter.kr/api/notices/top`;
  try {
    const data = await apiClient(apiURL, 'GET', '');
    return data.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export default getNoticesTop;
