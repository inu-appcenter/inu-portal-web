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

// 버스 관리자 API
export interface RouteSectionRequest {
  sectionName: string;
  category: string;
  tabName: string;
  routeNo: string;
  startStop?: string;
  endStop?: string;
}

export interface TargetStopRequest {
  bstopId: string;
  bstopName: string;
  category?: string;
}

export const createAdminRouteSection = async (data: RouteSectionRequest) => {
  const response = await tokenInstance.post<ApiResponse<any>>(
    "/api/admin/buses/routes",
    data,
  );
  return response.data;
};

export const getAdminRouteSections = async () => {
  const response = await tokenInstance.get<ApiResponse<any[]>>(
    "/api/admin/buses/routes",
  );
  return response.data;
};

export const autoSyncAdminRouteSections = async () => {
  const response = await tokenInstance.post<ApiResponse<any[]>>(
    "/api/admin/buses/routes/auto-sync",
  );
  return response.data;
};

export const updateAdminRouteSection = async (
  id: number,
  data: {
    sectionName: string;
    category: string;
    tabName?: string;
    busNotice?: string;
    routeNotice?: string;
  },
) => {
  const response = await tokenInstance.put<ApiResponse<any>>(
    `/api/admin/buses/routes/${id}`,
    data,
  );
  return response.data;
};

export const deleteAdminRouteSection = async (id: number) => {
  const response = await tokenInstance.delete<ApiResponse<any>>(
    `/api/admin/buses/routes/${id}`,
  );
  return response.data;
};

export const searchAdminBusStops = async (keyword: string) => {
  const response = await tokenInstance.get<ApiResponse<any[]>>(
    `/api/admin/buses/stops/search?keyword=${encodeURIComponent(keyword)}`,
  );
  return response.data;
};

export const getAdminStopAliases = async () => {
  const response = await tokenInstance.get<ApiResponse<any[]>>(
    "/api/admin/buses/stop-aliases",
  );
  return response.data;
};

export const saveAdminStopAlias = async (data: {
  bstopId: string;
  bstopName: string;
  stopAlias: string;
  stopNotice?: string;
  memo?: string;
}) => {

  const response = await tokenInstance.post<ApiResponse<any>>(
    "/api/admin/buses/stop-aliases",
    data,
  );
  return response.data;
};

export const deleteAdminStopAlias = async (id: number) => {
  const response = await tokenInstance.delete<ApiResponse<any>>(
    `/api/admin/buses/stop-aliases/${id}`,
  );
  return response.data;
};

export const getAdminTargetRules = async () => {
  const response = await tokenInstance.get<ApiResponse<any[]>>(
    "/api/admin/buses/target-rules",
  );
  return response.data;
};

export const addAdminTargetRule = async (data: {
  category: string;
  tabName: string;
  startBstopId: string;
  startStopName: string;
  startStopAlias?: string;
  endBstopId?: string;
  endBstopName?: string;
  endStopAlias?: string;
  targetKeywords?: string;
}) => {
  const response = await tokenInstance.post<ApiResponse<any>>(
    "/api/admin/buses/target-rules",
    data,
  );
  return response.data;
};

export const deleteAdminTargetRule = async (id: number) => {
  const response = await tokenInstance.delete<ApiResponse<any>>(
    `/api/admin/buses/target-rules/${id}`,
  );
  return response.data;
};

export const addAdminTargetStop = async (data: TargetStopRequest) => {
  const response = await tokenInstance.post<ApiResponse<any>>(
    "/api/admin/buses/target-stops",
    data,
  );
  return response.data;
};

export const getAdminTargetStops = async () => {
  const response = await tokenInstance.get<ApiResponse<any[]>>(
    "/api/admin/buses/target-stops",
  );
  return response.data;
};


