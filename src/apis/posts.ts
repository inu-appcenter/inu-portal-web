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
