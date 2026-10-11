import useUserStore from "@/stores/useUserStore";
import { isMockApiEnabled } from "@/mocks/mockFlag";
import { useFeatureFlag } from "@/hooks/useFeatureFlags";
import { FEATURE_FLAG_KEYS } from "@/types/featureFlags";

/**
 * 시간 맞추기 화면의 로그인 여부. 조율 API는 링크 미리보기만 빼고 모두 로그인이 필요하다.
 * 목 API(`npm run dev:mock`)는 세션 없이도 전 흐름을 확인할 수 있게 로그인한 것으로 본다.
 */
export const usePollLoggedIn = () => {
  const accessToken = useUserStore((state) => state.tokenInfo.accessToken);
  return Boolean(accessToken) || isMockApiEnabled();
};

/** 로그인하고 지금 화면으로 돌아오는 경로 */
export const buildLoginRedirect = (loginPath: string, returnTo: string) =>
  `${loginPath}?redirect=${encodeURIComponent(returnTo)}`;

/**
 * 시간 맞추기 진입점(홈 칩, 채팅방 사이드메뉴)을 보여 줄지.
 * 플래그는 진입점만 가린다. 참여 링크·채팅 카드로 들어오는 화면은 플래그와 무관하게 열린다
 * (소프트 런치 중에도 초대받은 사람은 참여할 수 있어야 한다).
 */
export const usePollEntryEnabled = () => {
  const { enabled } = useFeatureFlag(FEATURE_FLAG_KEYS.SCHEDULE_POLL);
  return enabled || isMockApiEnabled();
};
