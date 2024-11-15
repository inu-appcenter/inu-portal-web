import axiosInstance from "apis/axiosInstance";
import { ApiResponse } from "types/common";
import { Post } from "types/posts";

// 게시글 검색
export const getSearch = async (
  query: string,
  sort: string,
  page: number
): Promise<ApiResponse<{ pages: number; posts: Post[] }>> => {
  const params: { [key: string]: string | number } = {
    query,
    sort,
    page,
  };
  const response = await axiosInstance.get<
    ApiResponse<{ pages: number; posts: Post[] }>
  >("/api/search", { params });
  return response.data;
};
