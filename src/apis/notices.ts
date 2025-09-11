import axiosInstance from "apis/axiosInstance";
import { ApiResponse, Pagination } from "types/common";
import { Keyword, Notice } from "types/notices";
import tokenInstance from "./tokenInstance.ts";

// 모든 공지사항 가져오기
export const getNotices = async (
  category: string,
  sort: string,
  page: number,
): Promise<ApiResponse<Pagination<Notice[]>>> => {
  const params: { [key: string]: string | number } = {
    sort,
    page,
  };
  if (category !== "전체") {
    params.category = category;
  }
  const response = await axiosInstance.get<ApiResponse<Pagination<Notice[]>>>(
    "/api/notices",
    { params },
  );
  return response.data;
};

// 학과별 공지사항 가져오기
export const getDepartmentNotices = async (
  department: string,
  sort: "date" | "view" = "date",
  page: number = 1,
): Promise<ApiResponse<Pagination<Notice[]>>> => {
  if (!department) {
    throw new Error("department는 필수 값입니다.");
  }

  const params: { [key: string]: string | number } = {
    department,
    sort,
    page,
  };

  const response = await axiosInstance.get<ApiResponse<Pagination<Notice[]>>>(
    "/api/notices/department",
    { params },
  );
  return response.data;
};

// 상단부 인기 공지 12개 가져오기
export const getNoticesTop = async (): Promise<ApiResponse<Notice[]>> => {
  const response =
    await axiosInstance.get<ApiResponse<Notice[]>>("/api/notices/top");
  return response.data;
};

// 모든 키워드 알림 조회
export const getKeywords = async (): Promise<ApiResponse<Keyword[]>> => {
  const response =
    await tokenInstance.get<ApiResponse<Keyword[]>>("/api/keywords");
  return response.data;
};

// 키워드 알림 등록
export const createKeyword = async (
  keyword: string,
  department: string,
): Promise<ApiResponse<Keyword>> => {
  const params = { keyword, department };
  const response = await tokenInstance.post<ApiResponse<Keyword>>(
    "/api/keywords",
    null,
    { params },
  );
  return response.data;
};

// 새 글 알림 구독 학과 조회
export const getSubscribedDepartments = async (): Promise<
  ApiResponse<Keyword[]>
> => {
  const response = await tokenInstance.get<ApiResponse<Keyword[]>>(
    "/api/keywords/department",
  );
  return response.data;
};

// 학과 새 글 알림 구독
export const subscribeDepartment = async (
  department: string,
): Promise<ApiResponse<Keyword>> => {
  const params = { department };
  const response = await tokenInstance.post<ApiResponse<Keyword>>(
    "/api/keywords/department",
    null,
    { params },
  );
  return response.data;
};

// 구독 알림 삭제
export const deleteKeyword = async (
  keywordId: number,
): Promise<ApiResponse<number>> => {
  const response = await tokenInstance.delete<ApiResponse<number>>(
    `/api/keywords/${keywordId}`,
  );
  return response.data;
};
