import axiosInstance from "apis/axiosInstance";
import { ApiResponse } from "types/common";
import { Post } from "types/posts";

// 메인 페이지 게시글 7개 가져오기
export const getPostsMain = async (): Promise<ApiResponse<Post[]>> => {
  const response = await axiosInstance.get<ApiResponse<Post[]>>(
    `/api/posts/main`
  );
  return response.data;
};

// 모든 게시글 가져오기
export const getPosts = async (
  category: string,
  sort: string,
  page: number
): Promise<ApiResponse<{ pages: number; posts: Post[] }>> => {
  const params: { [key: string]: string | number } = {
    sort,
    page,
  };
  if (category !== "전체") {
    params.category = category;
  }
  const response = await axiosInstance.get<
    ApiResponse<{ pages: number; posts: Post[] }>
  >("/api/posts", { params });
  return response.data;
};

// 상단부 인기 게시글 12개 가져오기
export const getPostsTop = async (
  category: string
): Promise<ApiResponse<Post[]>> => {
  const response = await axiosInstance.get<ApiResponse<Post[]>>(
    `/api/posts/top${category ? `?category=${category}` : ""}`
  );
  return response.data;
};
