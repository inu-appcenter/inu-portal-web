import axiosInstance from "@/apis/axiosInstance";
import { ApiResponse, Pagination } from "@/types/common";
import {
  DepartmentNotice,
  Keyword,
  Notice,
  SearchNotice,
} from "@/types/notices";
import { Schedule } from "@/types/schedules";
import tokenInstance from "./tokenInstance.ts";

export type NoticeSort = "date" | "view";

export const ALL_NOTICE_CATEGORY = "전체";
export const NOTICE_LIST_STALE_TIME = 60 * 1000;

export const getNoticeSortParam = (sort?: string): NoticeSort =>
  sort === "like" || sort === "view" ? "view" : "date";

export const getNoticeListQueryKey = (
  category: string,
  sort: NoticeSort,
  page: number,
) => ["notices", "list", category, sort, page] as const;

export const getNoticeSearchQueryKey = (query: string, category?: string) =>
  ["notices", "search", query, category] as const;

const normalizeRequiredDepartment = (department: string): string => {
  const normalizedDepartment = department.trim();

  if (!normalizedDepartment) {
    throw new Error("Department is required.");
  }

  return normalizedDepartment;
};

// 전체 공지사항 조회
export const getNotices = async (
  category: string = ALL_NOTICE_CATEGORY,
  sort: NoticeSort = "date",
  page: number = 1,
): Promise<ApiResponse<Pagination<Notice[]>>> => {
  const params: { [key: string]: string | number } = {
    sort,
    page,
  };

  if (category !== ALL_NOTICE_CATEGORY) {
    params.category = category;
  }

  const response = await axiosInstance.get<ApiResponse<Pagination<Notice[]>>>(
    "/api/notices",
    { params },
  );
  return response.data;
};

// 공지사항 검색
export const searchNotices = async (
  query: string,
  category?: string,
  page: number = 1,
): Promise<ApiResponse<Pagination<SearchNotice[]>>> => {
  const params: { [key: string]: string | number } = {
    query,
    page,
  };

  if (category && category !== ALL_NOTICE_CATEGORY) {
    params.category = category;
  }

  const response = await axiosInstance.get<
    ApiResponse<Pagination<SearchNotice[]>>
  >("/api/notices/search", { params });
  return response.data;
};

// 학과 공지사항 조회
export const getDepartmentNotices = async (
  department: string,
  sort: "date" | "view" = "date",
  page: number = 1,
): Promise<ApiResponse<Pagination<DepartmentNotice[]>>> => {
  const normalizedDepartment = normalizeRequiredDepartment(department);

  const params: { [key: string]: string | number } = {
    department: normalizedDepartment,
    sort,
    page,
  };

  const response = await axiosInstance.get<
    ApiResponse<Pagination<DepartmentNotice[]>>
  >("/api/notices/department", { params });
  return response.data;
};

export const getDepartmentNoticeSchedules = async (
  departmentNoticeId: number,
): Promise<ApiResponse<Schedule[]>> => {
  const response = await axiosInstance.get<ApiResponse<Schedule[]>>(
    `/api/notices/department/${departmentNoticeId}/schedules`,
  );
  return response.data;
};

// 인기 공지사항 조회
export const getNoticesTop = async (): Promise<ApiResponse<Notice[]>> => {
  const response =
    await axiosInstance.get<ApiResponse<Notice[]>>("/api/notices/top");
  return response.data;
};

// 키워드 구독 목록 조회
export const getKeywords = async (): Promise<ApiResponse<Keyword[]>> => {
  const response =
    await tokenInstance.get<ApiResponse<Keyword[]>>("/api/keywords");
  return response.data;
};

// 키워드 구독 생성
export const createKeyword = async (
  keyword: string,
  department?: string,
  category?: string,
): Promise<ApiResponse<Keyword>> => {
  const normalizedKeyword = keyword.trim();

  if (!normalizedKeyword) {
    throw new Error("Keyword is required.");
  }

  const params: { keyword: string; department?: string; category?: string } = {
    keyword: normalizedKeyword,
  };

  if (department) params.department = department;
  if (category) params.category = category;

  const response = await tokenInstance.post<ApiResponse<Keyword>>(
    "/api/keywords",
    null,
    { params },
  );
  return response.data;
};

// 구독 중인 학교 공지 카테고리 조회
export const getKeywordsNotice = async (): Promise<ApiResponse<Keyword[]>> => {
  const response = await tokenInstance.get<ApiResponse<Keyword[]>>(
    "/api/keywords/notice",
  );
  return response.data;
};

// 학교 공지 카테고리 구독
export const subscribeKeywordsNotice = async (
  categories: string[],
): Promise<ApiResponse<Keyword[]>> => {
  const response = await tokenInstance.post<ApiResponse<Keyword[]>>(
    "/api/keywords/notice",
    categories,
  );
  return response.data;
};

// 구독 중인 학과 목록 조회
export const getSubscribedDepartments = async (): Promise<
  ApiResponse<Keyword[]>
> => {
  const response = await tokenInstance.get<ApiResponse<Keyword[]>>(
    "/api/keywords/department",
  );
  return response.data;
};

// 학과 공지 알림 구독
export const subscribeDepartment = async (
  departments: string[],
): Promise<ApiResponse<Keyword[]>> => {
  const response = await tokenInstance.post<ApiResponse<Keyword[]>>(
    "/api/keywords/department",
    departments,
  );
  return response.data;
};

// 키워드 구독 삭제
export const deleteKeyword = async (
  keywordId: number,
): Promise<ApiResponse<number>> => {
  const response = await tokenInstance.delete<ApiResponse<number>>(
    `/api/keywords/${keywordId}`,
  );
  return response.data;
};
