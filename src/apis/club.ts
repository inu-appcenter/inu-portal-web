import axiosInstance from "./axiosInstance";
import { ApiResponse } from "types/common";
import { Club } from "types/club";

// 동아리 리스트 가져오기
export const getClubs = async (
  category: string
): Promise<ApiResponse<Club[]>> => {
  if (category != "전체") {
    const response = await axiosInstance.get<ApiResponse<Club[]>>(
      `/api/clubs?category=${category}`
    );
    return response.data;
  } else {
    const response = await axiosInstance.get<ApiResponse<Club[]>>(`/api/clubs`);
    return response.data;
  }
};
