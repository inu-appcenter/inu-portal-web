import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
import { isMockApiEnabled } from "@/mocks/mockFlag";
import useUserStore from "@/stores/useUserStore";
import { isAdminUser } from "@/types/admin";

const hasSession = (accessToken: string) =>
  Boolean(accessToken) || Boolean(localStorage.getItem("tokenInfo"));

/**
 * 건의사항 화면은 로그인이 필요하다. 로그인 후 돌아올 수 있게 redirect를 붙여 보낸다.
 * 목 API(`npm run dev:mock`)는 세션 없이도 전 흐름을 확인할 수 있게 통과시킨다.
 * @returns 화면을 그려도 되는지
 */
export function useSuggestionAuthGuard(): boolean {
  const navigate = useNavigate();
  const location = useLocation();
  const accessToken = useUserStore((s) => s.tokenInfo.accessToken);
  const allowed = isMockApiEnabled() || hasSession(accessToken);

  useEffect(() => {
    if (allowed) return;
    const back = `${location.pathname}${location.search}`;
    navigate(`${ROUTES.LOGIN}?redirect=${encodeURIComponent(back)}`, {
      replace: true,
    });
  }, [allowed, location.pathname, location.search, navigate]);

  return allowed;
}

/** 관리자 화면 가드. 로그인 안 했거나 관리자가 아니면 홈으로 보낸다(기존 /admin 페이지와 같은 방식). */
export function useSuggestionAdminGuard(): boolean {
  const navigate = useNavigate();
  const accessToken = useUserStore((s) => s.tokenInfo.accessToken);
  const role = useUserStore((s) => s.userInfo.role);
  const mock = isMockApiEnabled();
  const loggedIn = hasSession(accessToken);
  // 토큰은 있는데 프로필(role)이 아직 안 온 동안은 판단을 미룬다.
  const allowed = mock || (loggedIn && (!role || isAdminUser(role)));

  useEffect(() => {
    if (mock) return;
    if (!loggedIn || (accessToken && role && !isAdminUser(role))) {
      navigate(ROUTES.HOME, { replace: true });
    }
  }, [mock, loggedIn, accessToken, role, navigate]);

  return allowed;
}
