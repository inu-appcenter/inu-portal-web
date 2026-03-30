import tokenInstance from "./tokenInstance.ts";
import { ApiResponse } from "../types/common.ts";
import {
  ApiLogData,
  FcmAdminLogData,
  FcmSendRequest,
  MemberLogData,
} from "../types/admin.ts";

export const getMemberLogs = async (
  date: string,
): Promise<ApiResponse<MemberLogData>> => {
  try {
    const response = await tokenInstance.get<ApiResponse<MemberLogData>>(
      `/api/logs/members?date=${date}`,
    );
    return response.data;
  } catch (error) {
    console.error("API request error:", error);
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
    console.error("API request error:", error);
    throw new Error("API 호출 순위 조회에 실패했습니다.");
  }
};

export const getFcmAdminLogs = async (
  page: number = 1,
): Promise<ApiResponse<FcmAdminLogData[]>> => {
  try {
    const response = await tokenInstance.get<ApiResponse<FcmAdminLogData[]>>(
      `/api/tokens/admin?page=${page}`,
    );
    return response.data;
  } catch (error) {
    console.error("API request error:", error);
    throw new Error("관리자 FCM 전송 이력 조회에 실패했습니다.");
  }
};

export const getFcmAdminLogResult = async (
  fcmMessageId: number,
): Promise<ApiResponse<FcmAdminLogData>> => {
  try {
    const response = await tokenInstance.get<ApiResponse<FcmAdminLogData>>(
      `/api/tokens/admin/${fcmMessageId}`,
    );
    return response.data;
  } catch (error) {
    console.error("API request error:", error);
    throw new Error("관리자 FCM 전송 결과 조회에 실패했습니다.");
  }
};

export const sendFcmAdminNotification = async (
  notificationData: FcmSendRequest,
): Promise<ApiResponse<number>> => {
  try {
    const response = await tokenInstance.post<ApiResponse<number>>(
      `/api/tokens/admin`,
      notificationData,
    );
    return response.data;
  } catch (error) {
    console.error("API request error:", error);
    throw new Error("회원 알림 전송에 실패했습니다.");
  }
};
