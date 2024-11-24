import axiosInstance from "apis/axiosInstance";
import tokenInstance from "apis/tokenInstance";
import { ApiResponse, Pagination } from "types/common";
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

// 게시글 수정
export const putPost = async (
  postId: number,
  title: string,
  content: string,
  category: string,
  anonymous: boolean
): Promise<ApiResponse<number>> => {
  const response = await tokenInstance.put<ApiResponse<number>>(
    `/api/posts/${postId}`,
    { title, content, category, anonymous }
  );
  return response.data;
};

// 게시글 삭제
export const deletePost = async (
  postId: number
): Promise<ApiResponse<number>> => {
  const response = await tokenInstance.delete<ApiResponse<number>>(
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
): Promise<ApiResponse<Pagination<Post[]>>> => {
  const params: { [key: string]: string | number } = {
    sort,
    page,
  };
  if (category !== "전체") {
    params.category = category;
  }
  const response = await axiosInstance.get<ApiResponse<Pagination<Post[]>>>(
    "/api/posts",
    { params }
  );
  return response.data;
};

// 게시글의 이미지 수정
export const putImages = async (
  postId: number,
  images: File[]
): Promise<ApiResponse<number>> => {
  const formData = new FormData();
  images.forEach((image) => formData.append("images", image));

  const response = await tokenInstance.put<ApiResponse<number>>(
    `/api/posts/${postId}/images`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data;
};

// 이미지 등록
export const postImages = async (
  postId: number,
  images: File[]
): Promise<ApiResponse<number>> => {
  const formData = new FormData();
  images.forEach((image) => formData.append("images", image));

  const response = await tokenInstance.post<ApiResponse<number>>(
    `/api/posts/${postId}/images`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data;
};

// 게시글 등록
export const postPost = async (
  title: string,
  content: string,
  category: string,
  anonymous: boolean
): Promise<ApiResponse<number>> => {
  const response = await tokenInstance.post<ApiResponse<number>>(`/api/posts`, {
    title,
    content,
    category,
    anonymous,
  });
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

// 모바일용 게시글 리스트 가져오기
export const getPostsMobile = async (
  lastPostId: number | undefined,
  category: string
): Promise<ApiResponse<Post[]>> => {
  const params: { [key: string]: string | number } = {};
  if (category !== "전체") {
    params.category = category;
  }
  if (typeof lastPostId === "number") {
    params.lastPostId = lastPostId;
  }
  const response = await axiosInstance.get<ApiResponse<Post[]>>(
    "/api/posts/mobile",
    { params }
  );
  return response.data;
};
