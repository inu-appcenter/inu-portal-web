import axiosInstance from "@/apis/axiosInstance";
import { ApiResponse, Pagination } from "@/types/common";
import {
  CollegeOfficeContact,
  DirectoryCategory,
  DirectoryEntry,
} from "@/types/directory";

export const getDirectoryEntries = async (
  category?: DirectoryCategory,
  query?: string,
  page: number = 1,
): Promise<ApiResponse<Pagination<DirectoryEntry[]>>> => {
  const params: Record<string, string | number> = { page };

  if (category) {
    params.category = category;
  }

  if (query?.trim()) {
    params.query = query.trim();
  }

  const response = await axiosInstance.get<ApiResponse<Pagination<DirectoryEntry[]>>>(
    "/api/directory",
    { params },
  );

  return response.data;
};

export const searchDirectoryEntries = async (
  category?: DirectoryCategory,
  query?: string,
  page: number = 1,
): Promise<ApiResponse<Pagination<DirectoryEntry[]>>> => {
  const params: Record<string, string | number> = { page };

  if (category) {
    params.category = category;
  }

  if (query?.trim()) {
    params.query = query.trim();
  }

  const response = await axiosInstance.get<ApiResponse<Pagination<DirectoryEntry[]>>>(
    "/api/directory/search",
    { params },
  );

  return response.data;
};

export const getCollegeOfficeContacts = async (
  query?: string,
  page: number = 1,
): Promise<ApiResponse<Pagination<CollegeOfficeContact[]>>> => {
  const params: Record<string, string | number> = { page };

  if (query?.trim()) {
    params.query = query.trim();
  }

  const response = await axiosInstance.get<
    ApiResponse<Pagination<CollegeOfficeContact[]>>
  >("/api/directory/college-office-contacts", { params });

  return response.data;
};

export const searchCollegeOfficeContacts = async (
  query?: string,
  page: number = 1,
): Promise<ApiResponse<Pagination<CollegeOfficeContact[]>>> => {
  const params: Record<string, string | number> = { page };

  if (query?.trim()) {
    params.query = query.trim();
  }

  const response = await axiosInstance.get<
    ApiResponse<Pagination<CollegeOfficeContact[]>>
  >("/api/directory/college-office-contacts/search", { params });

  return response.data;
};
