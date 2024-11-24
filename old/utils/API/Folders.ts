// Folders.ts
// utils/API/Folders.ts - 스크랩폴더 API
import apiClient from './apiClient';

// 스크랩폴더의 모든 게시글 가져오기
export const getFoldersPosts = async (token: string, folderId: number, sort: string, page: number) => {
  const apiURL = `https://portal.inuappcenter.kr/api/folders/${folderId}?sort=${sort}&page=${page}`;
  return await apiClient(apiURL, 'GET', token);
};

// 스크랩폴더명 수정
export const putFolders = async (token: string, folderId: number, name: string) => {
  const apiURL = `https://portal.inuappcenter.kr/api/folders/${folderId}`;
  const data = { name: name };
  return await apiClient(apiURL, 'PUT', token, data);
}

// 스크랩폴더 삭제
export const deleteFolders = async (token: string, folderId: number) => {
  const apiURL = `https://portal.inuappcenter.kr/api/folders/${folderId}`;
  return await apiClient(apiURL, 'DELETE', token);
};

// 회원의 모든 스크랩 폴더 가져오기
export const getFolders = async (token: string) => {
  const apiURL = `https://portal.inuappcenter.kr/api/folders`;
  return await apiClient(apiURL, 'GET', token);
};

// 스크랩폴더 생성
export const postFolders = async (token: string, foldername: string) => {
  const apiURL = 'https://portal.inuappcenter.kr/api/folders';
  const data = { name: foldername };
  return await apiClient(apiURL, 'POST', token, data);
};

// 스크랩폴더에 게시글 담기
export const postFoldersPosts = async (token: string, postId: number, folderId: number) => {
  const apiURL = `https://portal.inuappcenter.kr/api/folders/${folderId}/posts`;
  const data = { postId: [postId] };
  return await apiClient(apiURL, 'POST', token, data);
};

// 스크랩폴더에서 게시글 빼기
export const deleteFoldersPosts = async (token: string, postId: number, folderId: string) => {
  const apiURL = `https://portal.inuappcenter.kr/api/folders/${folderId}/posts`;
  const data = { postId: [postId] };
  return await apiClient(apiURL, 'DELETE', token, data);
};