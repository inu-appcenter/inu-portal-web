import { ApiResponse } from "@/types/common";
import axiosInstance from "./axiosInstance";

// 팁게시판 카테고리 정보 가져오기
export const getTipsCategories = async (): Promise<ApiResponse<string[]>> => {
  const response =
    await axiosInstance.get<ApiResponse<string[]>>(`/api/categories`);
  return response.data;
};

// 학교 공지 카테고리 정보 가져오기
export const getSchoolNoticeCategories = async (): Promise<
  ApiResponse<string[]>
> => {
  const response = await axiosInstance.get<ApiResponse<string[]>>(
    `/api/categories/notice`,
  );
  return response.data;
};
