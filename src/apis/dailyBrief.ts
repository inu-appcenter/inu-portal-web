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
  settings: Partial<DailyBriefSettings>,
): Promise<ApiResponse<DailyBriefSettings>> => {
  const current = getLocalDailyBriefSettings();
  const merged: DailyBriefSettings = { ...current, ...settings };
  setLocalDailyBriefSettings(merged);

  try {
    const response = await tokenInstance.put<ApiResponse<DailyBriefSettings>>(
      "/api/daily-brief/settings",
      merged,
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
    data: merged,
  };
};

const CARD_STORAGE_KEY = "intip_daily_brief_card_settings";

/**
 * 로컬 캐시/스토리지에서 Daily Brief 카드 설정 가져오기
 */
export const getLocalDailyBriefCardSettings = (): import("@/types/dailyBrief").DailyBriefCardSettings => {
  const savedStr = safeLocalStorage.getItem(CARD_STORAGE_KEY);
  if (!savedStr) {
    // Migration: check old individual keys if present
    const oldMode = safeLocalStorage.getItem("inu_daily_brief_card_mode") as "auto" | "custom" | null;
    const oldOrder = safeLocalStorage.getItem("inu_daily_brief_custom_order");
    const oldVis = safeLocalStorage.getItem("inu_daily_brief_card_visibility");

    const base: import("@/types/dailyBrief").DailyBriefCardSettings = {
      mode: oldMode === "custom" ? "custom" : "auto",
      order: oldOrder ? JSON.parse(oldOrder) : [
        "timetable",
        "library",
        "cafeteria",
        "bus",
        "weather",
        "notice",
        "lms",
        "fortune",
      ],
      visibility: oldVis ? JSON.parse(oldVis) : {
        timetable: true,
        library: true,
        cafeteria: true,
        bus: true,
        weather: true,
        notice: true,
        lms: true,
        fortune: true,
      },
      details: {
        library: { selectedRooms: ["제1열람실", "제2열람실", "제3열람실", "힐링존"] },
        cafeteria: { preferredCafeteria: "학생식당" },
        bus: { defaultType: "auto" },
      },
      timeRules: [],
    };
    return base;
  }
  try {
    const parsed = JSON.parse(savedStr);
    return {
      mode: parsed.mode || "auto",
      order: parsed.order || [
        "timetable",
        "library",
        "cafeteria",
        "bus",
        "weather",
        "notice",
        "lms",
        "fortune",
      ],
      visibility: parsed.visibility || {
        timetable: true,
        library: true,
        cafeteria: true,
        bus: true,
        weather: true,
        notice: true,
        lms: true,
        fortune: true,
      },
      details: {
        library: {
          selectedRooms: parsed.details?.library?.selectedRooms || ["제1열람실", "제2열람실", "제3열람실", "힐링존"],
        },
        cafeteria: {
          preferredCafeteria: parsed.details?.cafeteria?.preferredCafeteria || "학생식당",
        },
        bus: {
          defaultType: parsed.details?.bus?.defaultType || "auto",
          defaultStopName: parsed.details?.bus?.defaultStopName,
        },
      },
      timeRules: Array.isArray(parsed.timeRules) ? parsed.timeRules : [],
    };
  } catch {
    return {
      mode: "auto",
      order: [
        "timetable",
        "library",
        "cafeteria",
        "bus",
        "weather",
        "notice",
        "lms",
        "fortune",
      ],
      visibility: {
        timetable: true,
        library: true,
        cafeteria: true,
        bus: true,
        weather: true,
        notice: true,
        lms: true,
        fortune: true,
      },
      details: {
        library: { selectedRooms: ["제1열람실", "제2열람실", "제3열람실", "힐링존"] },
        cafeteria: { preferredCafeteria: "학생식당" },
        bus: { defaultType: "auto" },
      },
      timeRules: [],
    };
  }
};

/**
 * 로컬 캐시/스토리지에 Daily Brief 카드 설정 저장하기
 */
export const setLocalDailyBriefCardSettings = (
  settings: import("@/types/dailyBrief").DailyBriefCardSettings,
): void => {
  safeLocalStorage.setItem(CARD_STORAGE_KEY, JSON.stringify(settings));
  // Backward compatibility with individual keys for useDailyBriefRanking
  safeLocalStorage.setItem("inu_daily_brief_card_mode", settings.mode);
  safeLocalStorage.setItem("inu_daily_brief_custom_order", JSON.stringify(settings.order));
  safeLocalStorage.setItem("inu_daily_brief_card_visibility", JSON.stringify(settings.visibility));
  window.dispatchEvent(new Event("daily_brief_settings_changed"));
};

/**
 * Daily Brief 카드 설정 조회 (서버 동기화)
 */
export const getDailyBriefCardSettings = async (): Promise<
  import("@/types/dailyBrief").DailyBriefCardSettings
> => {
  try {
    const response = await tokenInstance.get<ApiResponse<{ cardSettingsJson?: string }>>(
      "/api/daily-brief/cards/settings",
    );
    if (response.data && response.data.data?.cardSettingsJson) {
      const parsed = JSON.parse(response.data.data.cardSettingsJson);
      const merged: import("@/types/dailyBrief").DailyBriefCardSettings = {
        ...getLocalDailyBriefCardSettings(),
        ...parsed,
      };
      setLocalDailyBriefCardSettings(merged);
      return merged;
    }
  } catch (error) {
    console.warn("백엔드 Daily Brief 카드 설정 조회 실패 (로컬 설정 사용):", error);
  }

  return getLocalDailyBriefCardSettings();
};

/**
 * Daily Brief 카드 설정 업데이트 (서버 동기화)
 */
export const updateDailyBriefCardSettings = async (
  settings: Partial<import("@/types/dailyBrief").DailyBriefCardSettings>,
): Promise<import("@/types/dailyBrief").DailyBriefCardSettings> => {
  const current = getLocalDailyBriefCardSettings();
  const merged: import("@/types/dailyBrief").DailyBriefCardSettings = {
    ...current,
    ...settings,
    details: {
      ...current.details,
      ...(settings.details || {}),
    },
    visibility: {
      ...current.visibility,
      ...(settings.visibility || {}),
    },
  };
  setLocalDailyBriefCardSettings(merged);

  try {
    await tokenInstance.put("/api/daily-brief/cards/settings", {
      cardSettingsJson: JSON.stringify(merged),
    });
  } catch (error) {
    console.warn("백엔드 Daily Brief 카드 설정 저장 실패 (로컬에만 저장됨):", error);
  }

  return merged;
};

