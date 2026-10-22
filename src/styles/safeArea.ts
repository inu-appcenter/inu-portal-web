/**
 * Safe Area Inset 스타일 토큰 및 헬퍼
 * 
 * Android WebView의 env() 미지원/불완전 지원 이슈를 극복하기 위해 네이티브 앱(intip-mobile-app)이
 * WebView 주입 스크립트를 통해 설정하는 `--native-safe-area-inset-*` CSS 변수를 1순위로 참조하고,
 * 일반 모바일 웹 브라우저 및 iOS 환경에서는 W3C 표준 env()로 안전하게 폴백(fallback)합니다.
 */

export const SAFE_AREA = {
  TOP: "var(--native-safe-area-inset-top, env(safe-area-inset-top, 0px))",
  BOTTOM: "var(--native-safe-area-inset-bottom, env(safe-area-inset-bottom, 0px))",
  LEFT: "var(--native-safe-area-inset-left, env(safe-area-inset-left, 0px))",
  RIGHT: "var(--native-safe-area-inset-right, env(safe-area-inset-right, 0px))",
} as const;

/**
 * 기본 베이스 여백(px)에 하단 안전영역을 더한 calc 문자열을 반환합니다.
 * 모바일 환경에서 기기 하단 제스처 바(Home Indicator) 바로 위에 요소가 바짝 붙지 않도록
 * 쾌적한 기본 여백을 함께 확보합니다.
 * 
 * @param basePx 모바일 터치 사용성을 위해 확보할 기본 여백 (기본값: 16px)
 * @example safeBottom(24) => "calc(24px + var(--native-safe-area-inset-bottom, env(safe-area-inset-bottom, 0px)))"
 */
export const safeBottom = (basePx: number = 16): string => {
  if (basePx === 0) return SAFE_AREA.BOTTOM;
  return `calc(${basePx}px + ${SAFE_AREA.BOTTOM})`;
};

/**
 * 기본 상단 여백(px)에 상단 안전영역을 더한 calc 문자열을 반환합니다.
 * @param basePx 기본 상단 여백 (기본값: 0px)
 * @example safeTop(12) => "calc(12px + var(--native-safe-area-inset-top, env(safe-area-inset-top, 0px)))"
 */
export const safeTop = (basePx: number = 0): string => {
  if (basePx === 0) return SAFE_AREA.TOP;
  return `calc(${basePx}px + ${SAFE_AREA.TOP})`;
};

/**
 * 일반 스크롤 페이지 최하단에 권장되는 넉넉하고 쾌적한 기본 여백
 */
export const PAGE_BOTTOM_SAFE_PADDING = `calc(36px + ${SAFE_AREA.BOTTOM})`;

/**
 * 플로팅 액션 버튼(FAB) 하단 위치에 권장되는 표준 위치
 */
export const FLOATING_BUTTON_SAFE_BOTTOM = `calc(24px + ${SAFE_AREA.BOTTOM})`;

/**
 * 화면 하단 고정 바(Fixed Bottom Bar) 내부 패딩에 권장되는 표준 패딩
 */
export const FIXED_BOTTOM_SAFE_PADDING = `calc(16px + ${SAFE_AREA.BOTTOM})`;
