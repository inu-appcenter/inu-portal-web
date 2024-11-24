import axiosInstance from "apis/axiosInstance";
import { ApiResponse, Pagination } from "types/common";
import { Post } from "types/posts";
import tokenInstance from "./tokenInstance";

// 게시글 검색
export const getSearch = async (
  query: string,
  sort: string,
  page: number
): Promise<ApiResponse<Pagination<Post[]>>> => {
  const params: { [key: string]: string | number } = {
    query,
    sort,
    page,
  };
  const response = await axiosInstance.get<ApiResponse<Pagination<Post[]>>>(
    "/api/search",
    { params }
  );
  return response.data;
};

// 스크랩 게시글 검색
export const getSearchScrap = async (
  query: string,
  sort: string,
  page: number
): Promise<ApiResponse<Pagination<Post[]>>> => {
  const params: { [key: string]: string | number } = {
    query,
    sort,
    page,
  };
  const response = await tokenInstance.get<ApiResponse<Pagination<Post[]>>>(
    "/api/search/scrap",
    { params }
  );
  return response.data;
};

// 스크랩 폴더에서 게시글 검색
export const getSearchFolderScrap = async (
  query: string,
  sort: string,
  page: number,
  folderId: number
): Promise<ApiResponse<Pagination<Post[]>>> => {
  const params: { [key: string]: string | number } = {
    query,
    sort,
    page,
  };
  const response = await tokenInstance.get<ApiResponse<Pagination<Post[]>>>(
    `/api/search/folder/${folderId}`,
    { params }
  );
  return response.data;
};
