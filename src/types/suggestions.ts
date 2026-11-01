// 건의사항(의견 보내기) 타입. 서버 `/api/suggestions` 응답 형태를 그대로 따른다.

export type SuggestionCategory =
  | "BUG_REPORT"
  | "FEATURE_SUGGESTION"
  | "SCHOOL_INFO_ERROR"
  | "ETC"
  | "CHEER";

export type SuggestionStatus =
  | "RECEIVED"
  | "IN_REVIEW"
  | "PLANNED"
  | "COMPLETED"
  | "ON_HOLD";

export type SuggestionOsType = "IOS" | "ANDROID" | "WEB";

export interface SuggestionDeviceInfo {
  appVersion?: string;
  osType?: SuggestionOsType;
  osVersion?: string;
  deviceModel?: string;
}

export interface SuggestionRequest extends SuggestionDeviceInfo {
  content: string;
  cheerMessage?: string;
  category: SuggestionCategory;
}

export interface SuggestionResponse {
  id: number;
  content: string;
  cheerMessage: string | null;
  category: SuggestionCategory;
  appVersion: string | null;
  osType: SuggestionOsType | null;
  osVersion: string | null;
  deviceModel: string | null;
  status: SuggestionStatus;
  /** "yyyy.MM.dd HH:mm:ss" */
  createDate: string;
  modifiedDate: string;
  memberId: number;
  memberNickname: string;
  imageCount: number;
}

export interface SuggestionPage {
  pages: number;
  total: number;
  suggestions: SuggestionResponse[];
}

export const SUGGESTION_CATEGORIES: {
  value: SuggestionCategory;
  label: string;
}[] = [
  { value: "BUG_REPORT", label: "오류 신고" },
  { value: "FEATURE_SUGGESTION", label: "기능 개선 제안" },
  { value: "SCHOOL_INFO_ERROR", label: "학교 정보 오류 제보" },
  { value: "ETC", label: "기타 의견" },
  { value: "CHEER", label: "개발진 응원" },
];

export const SUGGESTION_STATUSES: { value: SuggestionStatus; label: string }[] =
  [
    { value: "RECEIVED", label: "접수" },
    { value: "IN_REVIEW", label: "검토 중" },
    { value: "PLANNED", label: "반영 예정" },
    { value: "COMPLETED", label: "반영 완료" },
    { value: "ON_HOLD", label: "보류" },
  ];

export const SUGGESTION_CATEGORY_LABEL = Object.fromEntries(
  SUGGESTION_CATEGORIES.map((c) => [c.value, c.label]),
) as Record<SuggestionCategory, string>;

export const SUGGESTION_STATUS_LABEL = Object.fromEntries(
  SUGGESTION_STATUSES.map((s) => [s.value, s.label]),
) as Record<SuggestionStatus, string>;

export const SUGGESTION_CONTENT_MAX = 1000;
export const SUGGESTION_MAX_IMAGES = 5;
export const SUGGESTION_MAX_IMAGE_BYTES = 10 * 1024 * 1024;
export const SUGGESTION_MAX_TOTAL_BYTES = 20 * 1024 * 1024;

// react-query 캐시 키 접두사
export const SUGGESTION_QUERY_KEY = ["suggestions"] as const;
