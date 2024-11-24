// utils/API/Search.ts - 게시글 검색 API
import apiClient from './apiClient';

// 게시글 검색
export const search = async (query: string, sort: string, page: string) => {
  const apiURL = `https://portal.inuappcenter.kr/api/search?query=${query}&sort=${sort}&page=${page}`;
  return await apiClient(apiURL, 'GET', '');
};

// 스크랩 게시글 검색
export const searchScrap = async (token: string, query: string, sort: string, page: number) => {
  const apiURL = `https://portal.inuappcenter.kr/api/search/scrap?query=${query}&sort=${sort}&page=${page}`;
  return await apiClient(apiURL, 'GET', token);
};

// 스크랩 폴더에서 게시글 검색
export const searchFolder = async (token: string, folderId: number, query: string, sort: string, page: number) => {
  const apiURL = `https://portal.inuappcenter.kr/api/search/folder/${folderId}?query=${query}&sort=${sort}&page=${page}`;
  return await apiClient(apiURL, 'GET', token);
};
