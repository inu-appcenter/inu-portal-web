import axiosInstance from "@/apis/axiosInstance";
import { ApiResponse } from "@/types/common";
import { WeatherInfo } from "@/types/weathers";

// 날씨 가져오기
export const getWeathers = async (): Promise<ApiResponse<WeatherInfo>> => {
  const response =
    await axiosInstance.get<ApiResponse<WeatherInfo>>(`/api/weathers`);
  return response.data;
};
