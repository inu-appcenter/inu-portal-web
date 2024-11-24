import axiosInstance from "apis/axiosInstance";
import { ApiResponse } from "types/common";

// 학식 메뉴 가져오기
export const getCafeterias = async (cafeteria: string, day: number) => {
  const response = await axiosInstance.get<ApiResponse<string[]>>(
    `/api/cafeterias?cafeteria=${cafeteria}&day=${day}`
  );
  return response.data;
};
