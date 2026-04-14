import axiosInstance from "@/apis/axiosInstance";
import tokenInstance from "@/apis/tokenInstance";
import { ApiResponse } from "@/types/common";
import { Schedule } from "@/types/schedules";

export const getSchedules = async (
  year: number,
  month: number,
): Promise<ApiResponse<Schedule[]>> => {
  const response = await axiosInstance.get<ApiResponse<Schedule[]>>(
    `/api/schedules?year=${year}&month=${month}`,
  );
  return response.data;
};

export const getMyDeptSchedules = async (
  year: number,
  month: number,
): Promise<ApiResponse<Schedule[]>> => {
  const response = await tokenInstance.get<ApiResponse<Schedule[]>>(
    `/api/schedules/my-department?year=${year}&month=${month}`,
  );
  return response.data;
};

export const getScheduleById = async (
  scheduleId: number,
): Promise<ApiResponse<Schedule>> => {
  const response = await tokenInstance.get<ApiResponse<Schedule>>(
    `/api/schedules/${scheduleId}`,
  );
  return response.data;
};
