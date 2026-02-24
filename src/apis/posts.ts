import axiosInstance from "@/apis/axiosInstance";
import tokenInstance from "@/apis/tokenInstance";
import { ApiResponse, Pagination } from "@/types/common";
import { CategoryPosts, Post, PostDetail } from "@/types/posts";
import { AxiosError } from "axios";

// 게시글 가져오기
export const getPostDetail = async (
  postId: number,
): Promise<ApiResponse<PostDetail>> => {
  try {
    // 1) 우선 tokenInstance로 시도
    const response = await tokenInstance.get<ApiResponse<PostDetail>>(
      `/api/posts/${postId}`,
    );
    return response.data;
  } catch (error) {
    // 2) refreshError라면 axiosInstance로 재시도
    const typedError = error as AxiosError & { isRefreshError?: boolean };
    if (typedError.isRefreshError) {
      // 인증이 완전히 만료된 상태이므로, 비로그인(axiosInstance) 요청
      const response = await axiosInstance.get<ApiResponse<PostDetail>>(
        `/api/posts/${postId}`,
      );
      return response.data;
    }
    throw error; // 그 외 에러는 그대로 상위로 던짐
  }
};

// 게시글 수정
export const putPost = async (
  postId: number,
  title: string,
  content: string,
  category: string,
  anonymous: boolean,
  images: File[],
): Promise<ApiResponse<number>> => {
  const jsonData = {
    title,
    content,
    category,
    anonymous,
  };

  const formData = new FormData();

  const jsonBlob = new Blob([JSON.stringify(jsonData)], {
    type: "application/json",
  });
  formData.append("postDto", jsonBlob);
  images.forEach((image) => formData.append("images", image));

  const response = await tokenInstance.put<ApiResponse<number>>(
    `/api/posts/${postId}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );
  return response.data;
};

// 게시글 삭제
export const deletePost = async (
  postId: number,
): Promise<ApiResponse<number>> => {
  const response = await tokenInstance.delete<ApiResponse<number>>(
    `/api/posts/${postId}`,
  );
  return response.data;
};

// 스크랩 여부 변경
export const putScrap = async (
  postId: number,
): Promise<ApiResponse<number>> => {
  const response = await tokenInstance.put<ApiResponse<number>>(
    `/api/posts/${postId}/scrap`,
  );
  return response.data;
};

// 게시글 좋아요 여부 변경
export const putLike = async (postId: number): Promise<ApiResponse<number>> => {
  const response = await tokenInstance.put<ApiResponse<number>>(
    `/api/posts/${postId}/like`,
  );
  return response.data;
};

// 메인 페이지 게시글 7개 가져오기
export const getPostsMain = async (): Promise<ApiResponse<Post[]>> => {
  const response =
    await axiosInstance.get<ApiResponse<Post[]>>(`/api/posts/main`);
  return response.data;
};

// 모든 게시글 가져오기
export const getPosts = async (
  category: string,
  sort: string,
  page: number,
): Promise<ApiResponse<Pagination<Post[]>>> => {
  const params: { [key: string]: string | number } = {
    sort,
    page,
  };
  if (category !== "전체") {
    params.category = category;
  }

  try {
    // 1) 우선 tokenInstance로 시도
    const response = await tokenInstance.get<ApiResponse<Pagination<Post[]>>>(
      "/api/posts",
      { params },
    );
    return response.data;
  } catch (error) {
    // 2) refreshError라면 axiosInstance로 재시도
    const typedError = error as AxiosError & { isRefreshError?: boolean };
    if (typedError.isRefreshError) {
      // 인증이 완전히 만료된 상태이므로, 비로그인(axiosInstance) 요청
      const response = await axiosInstance.get<ApiResponse<Pagination<Post[]>>>(
        "/api/posts",
        { params },
      );
      return response.data;
    }
    throw error; // 그 외 에러는 그대로 상위로 던짐
  }
};

// 게시글 등록
export const postPost = async (
  title: string,
  content: string,
  category: string,
  anonymous: boolean,
  images: File[],
): Promise<ApiResponse<number>> => {
  const jsonData = {
    title,
    content,
    category,
    anonymous,
  };

  const formData = new FormData();

  const jsonBlob = new Blob([JSON.stringify(jsonData)], {
    type: "application/json",
  });
  formData.append("postDto", jsonBlob);
  images.forEach((image) => formData.append("images", image));

  const response = await tokenInstance.post<ApiResponse<number>>(
    `/api/posts`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );
  return response.data;
};

// 상단부 인기 게시글 12개 가져오기
export const getPostsTop = async (
  category: string,
): Promise<ApiResponse<Post[]>> => {
  const response = await axiosInstance.get<ApiResponse<Post[]>>(
    `/api/posts/top${category ? `?category=${category}` : ""}`,
  );
  return response.data;
};

// 모바일용 게시글 리스트 가져오기
export const getPostsMobile = async (
  lastPostId: number | undefined,
  category: string,
): Promise<ApiResponse<Post[]>> => {
  const params: { [key: string]: string | number } = {};
  if (category !== "전체") {
    params.category = category;
  }
  if (typeof lastPostId === "number") {
    params.lastPostId = lastPostId;
  }

  try {
    // 1) 우선 tokenInstance로 시도
    const response = await tokenInstance.get<ApiResponse<Post[]>>(
      "/api/posts/mobile",
      { params },
    );
    return response.data;
  } catch (error) {
    // 2) refreshError라면 axiosInstance로 재시도
    const typedError = error as AxiosError & { isRefreshError?: boolean };
    if (typedError.isRefreshError) {
      // 인증이 완전히 만료된 상태이므로, 비로그인(axiosInstance) 요청
      const response = await axiosInstance.get<ApiResponse<Post[]>>(
        "/api/posts/mobile",
        { params },
      );
      return response.data;
    }
    throw error; // 그 외 에러는 그대로 상위로 던짐
  }
};

export const getPostsByCategories = async (
  count?: number,
): Promise<ApiResponse<CategoryPosts[]>> => {
  const response = await axiosInstance.get<ApiResponse<CategoryPosts[]>>(
    `/api/posts/categories${count ? `?count=${count}` : ""}`,
  );

  return response.data;
};
