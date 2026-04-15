import axiosInstance from "@/apis/axiosInstance";
import tokenInstance from "@/apis/tokenInstance";
import type { ApiResponse } from "@/types/common";
import type {
  AdminFeatureFlag,
  ClientFeatureFlags,
  CreateFeatureFlagRequest,
  UpdateFeatureFlagRequest,
} from "@/types/featureFlags";

export const getFeatureFlags = async (): Promise<ClientFeatureFlags> => {
  try {
    const response =
      await axiosInstance.get<ApiResponse<ClientFeatureFlags>>("/api/feature-flags");
    return response.data.data ?? {};
  } catch (error) {
    console.error("API request error:", error);
    throw new Error("기능 플래그 조회에 실패했습니다.");
  }
};

export const getAdminFeatureFlags = async (): Promise<AdminFeatureFlag[]> => {
  try {
    const response =
      await tokenInstance.get<ApiResponse<AdminFeatureFlag[]>>(
        "/api/admin/feature-flags",
      );
    return response.data.data ?? [];
  } catch (error) {
    console.error("API request error:", error);
    throw new Error("관리자 기능 플래그 조회에 실패했습니다.");
  }
};

export const createFeatureFlag = async (
  body: CreateFeatureFlagRequest,
): Promise<AdminFeatureFlag> => {
  try {
    const response =
      await tokenInstance.post<ApiResponse<AdminFeatureFlag>>(
        "/api/admin/feature-flags",
        body,
      );
    return response.data.data;
  } catch (error) {
    console.error("API request error:", error);
    throw new Error("기능 플래그 생성에 실패했습니다.");
  }
};

export const updateFeatureFlag = async (
  key: string,
  body: UpdateFeatureFlagRequest,
): Promise<AdminFeatureFlag> => {
  try {
    const response =
      await tokenInstance.patch<ApiResponse<AdminFeatureFlag>>(
        `/api/admin/feature-flags/${key}`,
        body,
      );
    return response.data.data;
  } catch (error) {
    console.error("API request error:", error);
    throw new Error("기능 플래그 수정에 실패했습니다.");
  }
};
