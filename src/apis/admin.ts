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


/**
 * 관리자 전송 FCM 메시지 성공 횟수 조회
 * @param page 페이지 번호
 */
export const getFcmAdminLogs = async (
  page: number = 1,
): Promise<ApiResponse<FcmAdminLogData[]>> => {
  try {
    const response = await tokenInstance.get<ApiResponse<FcmAdminLogData[]>>(
      `/api/tokens/admin?page=${page}`,
    );
    return response.data;
  } catch (error) {
    console.error("API 요청 중 오류 발생:", error);
    throw new Error("관리자 FCM 메시지 성공 횟수 조회에 실패했습니다.");
  }
};

/**
 * 회원 알림 전송
 * @param notificationData 전송 정보
 */
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
    console.error("API 요청 중 오류 발생:", error);
    throw new Error("회원 알림 전송에 실패했습니다.");
  }
};