// getCategories.tsx
import apiClient from '../apiClient';

const getCategories = async () => {
  const apiURL = `https://portal.inuappcenter.kr/api/categories`;
  try {
    const data = await apiClient(apiURL, 'GET', '');
    return data.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export default getCategories;
