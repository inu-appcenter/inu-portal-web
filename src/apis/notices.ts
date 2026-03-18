import axiosInstance from "@/apis/axiosInstance";
import { ApiResponse, Pagination } from "@/types/common";
import { Keyword, Notice } from "@/types/notices";
import tokenInstance from "./tokenInstance.ts";

export type NoticeSort = "date" | "view";

export const ALL_NOTICE_CATEGORY = "\uC804\uCCB4";
export const NOTICE_LIST_STALE_TIME = 60 * 1000;

export const getNoticeSortParam = (sort?: string): NoticeSort =>
  sort === "like" || sort === "view" ? "view" : "date";

export const getNoticeListQueryKey = (
  category: string,
  sort: NoticeSort,
  page: number,
) => ["notices", "list", category, sort, page] as const;

// Fetch all notices.
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

// Fetch department notices.
export const getDepartmentNotices = async (
  department: string,
  sort: "date" | "view" = "date",
  page: number = 1,
): Promise<ApiResponse<Pagination<Notice[]>>> => {
  if (!department) {
    throw new Error("Department is required.");
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

// Fetch top notices.
export const getNoticesTop = async (): Promise<ApiResponse<Notice[]>> => {
  const response =
    await axiosInstance.get<ApiResponse<Notice[]>>("/api/notices/top");
  return response.data;
};

// Fetch all keyword subscriptions.
export const getKeywords = async (): Promise<ApiResponse<Keyword[]>> => {
  const response =
    await tokenInstance.get<ApiResponse<Keyword[]>>("/api/keywords");
  return response.data;
};

// Create a keyword subscription.
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

// Fetch subscribed departments.
export const getSubscribedDepartments = async (): Promise<
  ApiResponse<Keyword[]>
> => {
  const response = await tokenInstance.get<ApiResponse<Keyword[]>>(
    "/api/keywords/department",
  );
  return response.data;
};

// Subscribe to department notifications.
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

// Delete a keyword subscription.
export const deleteKeyword = async (
  keywordId: number,
): Promise<ApiResponse<number>> => {
  const response = await tokenInstance.delete<ApiResponse<number>>(
    `/api/keywords/${keywordId}`,
  );
  return response.data;
};
