export const FEATURE_FLAG_KEYS = {
  LABS: "LABS",
  FESTIVAL: "FESTIVAL",
  /** 시간 맞추기 진입점 노출(PRD v3.4 오픈 전략: 소프트 런치 → 전체 오픈) */
  SCHEDULE_POLL: "SCHEDULE_POLL",
} as const;

export type ClientFeatureFlags = Record<string, boolean>;

export interface AdminFeatureFlag {
  key: string;
  enabled: boolean;
  clientVisible: boolean;
  description: string | null;
}

export interface CreateFeatureFlagRequest {
  key: string;
  enabled: boolean;
  clientVisible: boolean;
  description?: string;
}

export interface UpdateFeatureFlagRequest {
  enabled: boolean;
  clientVisible: boolean;
  description?: string;
}
