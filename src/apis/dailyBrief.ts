import tokenInstance from "@/apis/tokenInstance";
import type { ApiResponse } from "@/types/common";
import {
  DailyBriefSettings,
  DEFAULT_DAILY_BRIEF_SETTINGS,
} from "@/types/dailyBrief";
import { safeLocalStorage } from "@/utils/safeStorage";

const STORAGE_KEY = "intip_daily_brief_settings";

/**
 * 로컬 캐시/스토리지에서 Daily Brief 설정 가져오기
 */
export const getLocalDailyBriefSettings = (): DailyBriefSettings => {
  const savedStr = safeLocalStorage.getItem(STORAGE_KEY);
  if (!savedStr) return DEFAULT_DAILY_BRIEF_SETTINGS;
  try {
    const parsed = JSON.parse(savedStr) as DailyBriefSettings;
    return { ...DEFAULT_DAILY_BRIEF_SETTINGS, ...parsed };
  } catch {
    return DEFAULT_DAILY_BRIEF_SETTINGS;
  }
};

/**
 * 로컬 캐시/스토리지에 Daily Brief 설정 저장하기
 */
export const setLocalDailyBriefSettings = (settings: DailyBriefSettings): void => {
  safeLocalStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
};

/**
 * Daily Brief 알림 설정 조회
 */
export const getDailyBriefSettings = async (): Promise<
  ApiResponse<DailyBriefSettings>
> => {
  try {
    const response = await tokenInstance.get<ApiResponse<DailyBriefSettings>>(
      "/api/daily-brief/settings",
    );
    if (response.data && response.data.data) {
      setLocalDailyBriefSettings(response.data.data);
      return response.data;
    }
  } catch (error) {
    // 백엔드 API가 아직 배포되지 않았거나 실패한 경우 로컬 설정 fallback 반환
    console.warn("백엔드 Daily Brief 설정 조회 실패 (로컬 설정 사용):", error);
  }

  return {
    result: [],
    msg: "성공",
    data: getLocalDailyBriefSettings(),
  };
};

/**
 * Daily Brief 알림 설정 업데이트
 */
export const updateDailyBriefSettings = async (
  settings: DailyBriefSettings,
): Promise<ApiResponse<DailyBriefSettings>> => {
  setLocalDailyBriefSettings(settings);

  try {
    const response = await tokenInstance.put<ApiResponse<DailyBriefSettings>>(
      "/api/daily-brief/settings",
      settings,
    );
    if (response.data && response.data.data) {
      setLocalDailyBriefSettings(response.data.data);
      return response.data;
    }
  } catch (error) {
    console.warn("백엔드 Daily Brief 설정 저장 실패 (로컬에만 저장됨):", error);
  }

  return {
    result: [],
    msg: "성공",
    data: settings,
  };
};
