import tokenInstance from "apis/tokenInstance";
import { ApiResponse, Pagination } from "types/common";
import { Post } from "types/posts";
import { Folder } from "types/folders";

// 스크랩폴더의 모든 게시글 가져오기
export const getFoldersPosts = async (
  folderId: number,
  sort: string,
  page: number
): Promise<ApiResponse<Pagination<Post[]>>> => {
  const response = await tokenInstance.get<ApiResponse<Pagination<Post[]>>>(
    `/api/folders/${folderId}?sort=${sort}&page=${page}`
  );
  return response.data;
};

// 스크랩폴더명 수정
export const putFolders = async (
  folderId: number,
  name: string
): Promise<ApiResponse<number>> => {
  const response = await tokenInstance.put<ApiResponse<number>>(
    `/api/folders/${folderId}`,
    name
  );
  return response.data;
};

// 스크랩폴더 삭제
export const deleteFolders = async (
  folderId: number
): Promise<ApiResponse<number>> => {
  const response = await tokenInstance.delete<ApiResponse<number>>(
    `/api/folders/${folderId}`
  );
  return response.data;
};

// 회원의 모든 스크랩 폴더 가져오기
export const getFolders = async (): Promise<ApiResponse<Folder[]>> => {
  const response = await tokenInstance.get<ApiResponse<Folder[]>>(
    `/api/folders`
  );
  return response.data;
};

// 스크랩폴더 생성
export const postFolders = async (
  name: string
): Promise<ApiResponse<number>> => {
  const response = await tokenInstance.post<ApiResponse<number>>(
    `/api/folders`,
    { name }
  );
  return response.data;
};

// 스크랩폴더에 게시글 담기
export const postFoldersPosts = async (
  folderId: number,
  postId: number[]
): Promise<ApiResponse<number>> => {
  const response = await tokenInstance.post<ApiResponse<number>>(
    `/api/folders/${folderId}/posts`,
    { postId }
  );
  return response.data;
};

// 스크랩폴더에서 게시글 빼기
export const deleteFoldersPosts = async (
  folderId: number,
  postId: number[]
): Promise<ApiResponse<number>> => {
  const response = await tokenInstance.delete<ApiResponse<number>>(
    `/api/folders/${folderId}/posts`,
    { data: { postId } }
  );
  return response.data;
};
