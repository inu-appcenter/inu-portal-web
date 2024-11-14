import axiosInstance from "apis/axiosInstance";
import tokenInstance from "apis/tokenInstance";
import { ApiResponse } from "types/common";
import { TokenInfo, UserInfo } from "types/members";

// 회원 가져오기
export const getMembers = async (): Promise<ApiResponse<UserInfo>> => {
  const response = await tokenInstance.get<ApiResponse<UserInfo>>(
    `/api/members`
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
  const response = await tokenInstance.post<ApiResponse<TokenInfo>>(
    `/api/members/refresh`
  );
  return response.data;
};
