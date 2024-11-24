import axiosInstance from "apis/axiosInstance";
import { ApiResponse } from "types/common";
import { Notice } from "types/notices";

// 모든 공지사항 가져오기
export const getNotices = async (
  category: string,
  sort: string,
  page: number
): Promise<ApiResponse<{ page: number; notices: Notice[] }>> => {
  const params: { [key: string]: string | number } = {
    sort,
    page,
  };
  if (category !== "전체") {
    params.category = category;
  }
  const response = await axiosInstance.get<
    ApiResponse<{ page: number; notices: Notice[] }>
  >("/api/notices", { params });
  return response.data;
};

// 상단부 인기 공지 12개 가져오기
export const getNoticesTop = async (): Promise<ApiResponse<Notice[]>> => {
  const response = await axiosInstance.get<ApiResponse<Notice[]>>(
    "/api/notices/top"
  );
  return response.data;
};
