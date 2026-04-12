import axiosInstance from "@/apis/axiosInstance";
import { ApiResponse } from "@/types/common";
import { DeptSchedule, SchoolSchedule } from "@/types/schedules";
import tokenInstance from "@/apis/tokenInstance";

// 학사일정 가져오기
export const getSchedules = async (
  year: number,
  month: number,
): Promise<ApiResponse<SchoolSchedule[]>> => {
  const response = await axiosInstance.get<ApiResponse<SchoolSchedule[]>>(
    `/api/schedules?year=${year}&month=${month}`,
  );
  return response.data;
};

//내 학과 일정 가져오기
export const getMyDeptSchedules = async (
  year: number,
  month: number,
): Promise<ApiResponse<SchoolSchedule[]>> => {
  const response = await tokenInstance.get<ApiResponse<DeptSchedule[]>>(
    `/api/schedules/my-department?year=${year}&month=${month}`,
  );
  return response.data;
};
