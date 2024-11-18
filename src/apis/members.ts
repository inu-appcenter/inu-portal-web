import axiosInstance from "apis/axiosInstance";
import tokenInstance from "apis/tokenInstance";
import { ApiResponse } from "types/common";
import { TokenInfo, UserInfo, MembersReplies } from "types/members";
import { Post } from "types/posts";

// 회원 가져오기
export const getMembers = async (): Promise<ApiResponse<UserInfo>> => {
  const response = await tokenInstance.get<ApiResponse<UserInfo>>(
    `/api/members`
  );
  return response.data;
};

// 회원 닉네임/횃불이 이미지 변경
export const putMembers = async (
  nickname: string,
  fireId: number
): Promise<ApiResponse<number>> => {
  const response = await tokenInstance.put<ApiResponse<number>>(
    `/api/members`,
    { nickname, fireId }
  );
  return response.data;
};

// 로그인
export const login = async (
  studentId: string,
  password: string
): Promise<ApiResponse<TokenInfo>> => {
  const response = await axiosInstance.post<ApiResponse<TokenInfo>>(
    `/api/members/login`,
    {
      studentId,
      password,
    }
  );
  return response.data;
};

// 토큰 재발급
export const refresh = async (): Promise<ApiResponse<TokenInfo>> => {
  const response = await axiosInstance.post<ApiResponse<TokenInfo>>(
    `/api/members/refresh`
  );
  return response.data;
};

// 회원이 작성한 모든 댓글 가져오기
export const getMembersReplies = async (
  sort: string
): Promise<ApiResponse<MembersReplies[]>> => {
  const response = await tokenInstance.get<ApiResponse<MembersReplies[]>>(
    `/api/members/replies?sort=${sort}`
  );
  return response.data;
};

// 회원이 작성한 모든 글 가져오기
export const getMembersPosts = async (
  sort: string
): Promise<ApiResponse<Post[]>> => {
  const response = await tokenInstance.get<ApiResponse<Post[]>>(
    `/api/members/posts?sort=${sort}`
  );
  return response.data;
};

// 회원이 좋아요한 모든 글 가져오기
export const getMembersLikes = async (
  sort: string
): Promise<ApiResponse<Post[]>> => {
  const response = await tokenInstance.get<ApiResponse<Post[]>>(
    `/api/members/likes?sort=${sort}`
  );
  return response.data;
};
