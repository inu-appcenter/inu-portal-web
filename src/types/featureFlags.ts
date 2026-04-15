export const FEATURE_FLAG_KEYS = {
  LABS: "LABS",
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
