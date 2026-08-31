import BusIcon from "./bus.svg?react";
import ChatIcon from "./chat.svg?react";
import HomeIcon from "./home.svg?react";
import MypageIcon from "./mypage.svg?react";
import SaveIcon from "./save.svg?react";

/**
 * 구(舊) 하단 내비게이션(MobileNav.tsx, 죽은 컴포넌트)의 탭 아이콘.
 * 원래 아이콘마다 파란(active)/회색(inactive) 파일이 따로 있었으나
 * (예: home-blue.svg / home-gray.svg), diff 결과 색상 hex만 다르고 path는
 * 반올림 오차 수준으로 동일해 currentColor 벡터 1장으로 통합했다(5쌍 → 5장).
 *
 * home 아이콘만 active 상태에서 지붕(#B5C5F2)과 몸통(#9CAFE2)이 다른
 * 투톤이라(inactive는 #D6D1D5 단색) 완전한 currentColor 단일값으로는
 * 표현할 수 없다. 지붕 path만 CSS 커스텀 프로퍼티
 * `--mobile-nav-home-accent`로 분리해, active일 때만 호출부에서 그 값을
 * 지정하고 inactive는 지정하지 않아 currentColor로 자연히 폴백되어
 * (D6D1D5) 원래의 단색 회색 렌더링을 그대로 재현한다.
 */
export { BusIcon, ChatIcon, HomeIcon, MypageIcon, SaveIcon };

export type MobileNavIconName = "home" | "save" | "bus" | "chat" | "mypage";

/** 탭별 active/inactive 색상. weather/의 day/night 중첩 객체와 같은 (이름 × 상태) 복합 키 패턴. */
export const MOBILE_NAV_ICON_COLORS: Record<
  MobileNavIconName,
  { active: string; inactive: string; activeAccent?: string }
> = {
  home: { active: "#9CAFE2", inactive: "#D6D1D5", activeAccent: "#B5C5F2" },
  save: { active: "#9CAFE2", inactive: "#D6D1D5" },
  bus: { active: "#9CAFE2", inactive: "#D6D1D5" },
  chat: { active: "#5E92F0", inactive: "#D6D1D5" },
  mypage: { active: "#9CAFE2", inactive: "#D6D1D5" },
};
