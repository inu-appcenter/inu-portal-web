import tokenInstance from "apis/tokenInstance";
import { ApiResponse } from "types/common";
import { PredictResult, FiresPagination } from "types/fires";

// 횃불이 ai 그림 그리기
export const postFiresPredict = async (
  prompt: string
): Promise<ApiResponse<PredictResult>> => {
  const response = await tokenInstance.post<ApiResponse<PredictResult>>(
    `/api/fires/predict`,
    { prompt }
  );
  return response.data;
};

export const getFires = async (
  page: number
): Promise<ApiResponse<FiresPagination>> => {
  const response = await tokenInstance.get<ApiResponse<FiresPagination>>(
    `/api/fires?page=${page}`
  );

  return response.data;
};
