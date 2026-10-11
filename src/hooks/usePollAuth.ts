import useUserStore from "@/stores/useUserStore";
import { isMockApiEnabled } from "@/mocks/mockFlag";

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
