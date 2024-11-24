// utils/API/Categories.ts - 횃불이Ai API
import apiClient from "./apiClient";

// 횃불이 ai 그림 그리기
export const predict = async (token: string, prompt: string) => {
  return await apiClient(
    "https://portal.inuappcenter.kr/api/fires/predict",
    "POST",
    token,
    { prompt }
  );
};

// 횃불이 ai 이미지 정보 가져오기
export const getFiresV2 = async (token: string, page: number) => {
  return await apiClient(
    `https://portal.inuappcenter.kr/api/fires?page=${page}`,
    "GET",
    token
  );
};

// OLD
// 횃불이 ai 그림 그리기
export const postFires = async (param: string, token: string) => {
  return await apiClient(
    "https://portal.inuappcenter.kr/api/fires",
    "POST",
    token,
    { param }
  );
};

// 횃불이 ai 이미지 별점 추가
export const postFiresRating = async (
  token: string,
  rating: number,
  id: string
) => {
  return await apiClient(
    `https://portal.inuappcenter.kr/api/fires/rating/${id}`,
    "POST",
    token,
    { rating }
  );
};

// 횃불이 ai 이미지 가져오기
export const getFires = async (id: string) => {
  return await apiClient(
    `https://portal.inuappcenter.kr/api/fires/${id}`,
    "GET",
    "",
    undefined,
    "blob"
  );
};
