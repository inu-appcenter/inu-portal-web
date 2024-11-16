import axiosInstance from "apis/axiosInstance";
import tokenInstance from "apis/tokenInstance";
import { ApiResponse } from "types/common";
import { Post, PostDetail } from "types/posts";

// 게시글 가져오기
export const getPostDetail = async (
  postId: number
): Promise<ApiResponse<PostDetail>> => {
  const response = await tokenInstance.get<ApiResponse<PostDetail>>(
    `/api/posts/${postId}`
  );
  return response.data;
};

// 스크랩 여부 변경
export const putScrap = async (
  postId: number
): Promise<ApiResponse<number>> => {
  const response = await tokenInstance.put<ApiResponse<number>>(
    `/api/posts/${postId}/scrap`
  );
  return response.data;
};

// 게시글 좋아요 여부 변경
export const putLike = async (postId: number): Promise<ApiResponse<number>> => {
  const response = await tokenInstance.put<ApiResponse<number>>(
    `/api/posts/${postId}/like`
  );
  return response.data;
};

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
