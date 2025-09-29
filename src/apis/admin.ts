import tokenInstance from "./tokenInstance.ts";
import { ApiResponse } from "../types/common.ts";
import { ApiLogData, MemberLogData } from "../types/admin.ts";

export const getMemberLogs = async (
  date: string,
): Promise<ApiResponse<MemberLogData>> => {
  try {
    const response = await tokenInstance.get<ApiResponse<MemberLogData>>(
      `/api/logs/members?date=${date}`,
    );
    return response.data;
  } catch (error) {
    console.error("API 요청 중 오류 발생:", error);
    throw new Error("특정 날짜 접속 회원 조회에 실패했습니다.");
  }
};

export const getApiLogs = async (
  date: string,
): Promise<ApiResponse<ApiLogData[]>> => {
  try {
    const response = await tokenInstance.get<ApiResponse<ApiLogData[]>>(
      `/api/logs/apis?date=${date}`,
    );
    return response.data;
  } catch (error) {
    console.error("API 요청 중 오류 발생:", error);
    throw new Error("API 호출 순위 조회에 실패했습니다.");
  }
};
