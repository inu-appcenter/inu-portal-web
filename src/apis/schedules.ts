import axiosInstance from "apis/axiosInstance";
import { ApiResponse } from "types/common";
import { Schedule } from "types/schedules";

// 학사일정 가져오기
export const getSchedules = async (
  year: number,
  month: number
): Promise<ApiResponse<Schedule[]>> => {
  const response = await axiosInstance.get<ApiResponse<Schedule[]>>(
    `/api/schedules?year=${year}&month=${month}`
  );
  return response.data;
};
