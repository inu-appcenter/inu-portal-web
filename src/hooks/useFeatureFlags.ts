import { useQuery } from "@tanstack/react-query";
import { getFeatureFlags } from "@/apis/featureFlags";

export const FEATURE_FLAGS_QUERY_KEY = ["feature-flags"] as const;

export const useFeatureFlags = () => {
  const query = useQuery({
    queryKey: FEATURE_FLAGS_QUERY_KEY,
    queryFn: getFeatureFlags,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
  });

  const flags = query.data ?? {};
  const isEnabled = (key: string) => Boolean(flags[key]);

  return {
    ...query,
    flags,
    isEnabled,
  };
};

export const useFeatureFlag = (key: string) => {
  const { flags, isEnabled, ...query } = useFeatureFlags();

  return {
    ...query,
    flags,
    enabled: isEnabled(key),
  };
};
