// utils/API/Posts.ts - 게시글 API
import apiClient from './apiClient';

interface PostData {
  title: string;
  content: string;
  category: string;
  anonymous: boolean;
}

// 게시글 가져오기
export const getPost = async (token: string, postId: string) => {
  return await apiClient(`https://portal.inuappcenter.kr/api/posts/${postId}`, 'GET', token);
};

// 게시글 수정
export const putPost = async (data: PostData, token: string, postId: string) => {
  return await apiClient(`https://portal.inuappcenter.kr/api/posts/${postId}`, 'PUT', token, data);
};

// 게시글 삭제
export const deletePost = async (token: string, postId: string) => {
  return await apiClient(`https://portal.inuappcenter.kr/api/posts/${postId}`, 'DELETE', token);
};

// 스크랩 여부 변경
export const handlePostScrap = async (token: string, postId: string) => {
  return await apiClient(`https://portal.inuappcenter.kr/api/posts/${postId}/scrap`, 'PUT', token);
};

// 게시글 좋아요 여부 변경
export const handlePostLike = async (token: string, postId: string) => {
  return await apiClient(`https://portal.inuappcenter.kr/api/posts/${postId}/like`, 'PUT', token);
};

// 게시글의 이미지 수정 : TODO

// 이미지 등록 : TODO

// 모든 게시글 가져오기
export const getPosts = async (category: string, sort: string, page: string) => {
  const apiURL = category === '전체'
    ? `https://portal.inuappcenter.kr/api/posts?sort=${sort}&page=${page}`
    : `https://portal.inuappcenter.kr/api/posts?category=${category}&sort=${sort}&page=${page}`;
  return await apiClient(apiURL, 'GET', '');
};

// 게시글 등록
export const postPosts = async (data: PostData, token: string) => {
  return await apiClient(`https://portal.inuappcenter.kr/api/posts`, 'POST', token, data);
};

// 게시글의 이미지 가져오기 : TODO

// 상단부 인기 게시글 12개 가져오기
export const getPostsTop = async (category: string = '전체') => {
  const apiURL = category === '전체'
    ? `https://portal.inuappcenter.kr/api/posts/top`
    : `https://portal.inuappcenter.kr/api/posts/top?category=${category}`;
  return await apiClient(apiURL, 'GET', '');
};