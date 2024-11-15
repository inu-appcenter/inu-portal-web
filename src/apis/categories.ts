import { ApiResponse } from "types/common";
import axiosInstance from "./axiosInstance";

// 모든 카테고리 가져오기
export const getCategories = async (): Promise<ApiResponse<string[]>> => {
  const response = await axiosInstance.get<ApiResponse<string[]>>(
    `/api/categories`
  );
  return response.data;
};
