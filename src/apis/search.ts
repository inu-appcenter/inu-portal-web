import axiosInstance from "@/apis/axiosInstance";
import { ApiResponse, Pagination } from "@/types/common";
import { Post } from "@/types/posts";
import tokenInstance from "./tokenInstance";
import { AxiosError } from "axios";

// 게시글 검색
export const getSearch = async (
  query: string,
  sort: string,
  page: number,
): Promise<ApiResponse<Pagination<Post[]>>> => {
  const params: { [key: string]: string | number } = {
    query,
    sort,
    page,
  };

  try {
    // 1) 우선 tokenInstance로 시도
    const response = await tokenInstance.get<ApiResponse<Pagination<Post[]>>>(
      "/api/search",
      { params },
    );
    return response.data;
  } catch (error) {
    // 2) refreshError라면 axiosInstance로 재시도
    const typedError = error as AxiosError & { isRefreshError?: boolean };
    if (typedError.isRefreshError) {
      // 인증이 완전히 만료된 상태이므로, 비로그인(axiosInstance) 요청
      const response = await axiosInstance.get<ApiResponse<Pagination<Post[]>>>(
        "/api/search",
        { params },
      );
      return response.data;
    }
    throw error; // 그 외 에러는 그대로 상위로 던짐
  }
};

// 스크랩 게시글 검색
export const getSearchScrap = async (
  query: string,
  sort: string,
  page: number,
): Promise<ApiResponse<Pagination<Post[]>>> => {
  const params: { [key: string]: string | number } = {
    query,
    sort,
    page,
  };
  const response = await tokenInstance.get<ApiResponse<Pagination<Post[]>>>(
    "/api/search/scrap",
    { params },
  );
  return response.data;
};

// 스크랩 폴더에서 게시글 검색
export const getSearchFolderScrap = async (
  query: string,
  sort: string,
  page: number,
  folderId: number,
): Promise<ApiResponse<Pagination<Post[]>>> => {
  const params: { [key: string]: string | number } = {
    query,
    sort,
    page,
  };
  const response = await tokenInstance.get<ApiResponse<Pagination<Post[]>>>(
    `/api/search/folder/${folderId}`,
    { params },
  );
  return response.data;
};
