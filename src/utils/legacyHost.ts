/**
 * 구 배포 도메인 접속 안내 판정.
 *
 * `intip-test.pages.dev`는 예전 Cloudflare Pages 기본 도메인으로, 현재 서비스 주소는
 * `intip.inuappcenter.kr`이다. 앱(WebView)이 예전 주소를 물고 켜지는 경우가 있어
 * 리다이렉트 대신 안내 화면을 먼저 띄운다(리다이렉트는 캐시·딥링크 상태가 섞여 더
 * 헷갈리는 화면이 나온다). 다만 이 주소를 의도적으로 쓰는 경우(개발/테스트 확인)도
 * 있어 "그래도 들어가기"로 안내를 넘기고 그대로 이용할 수 있게 둔다.
 */
export const LEGACY_HOSTNAME = "intip-test.pages.dev";

export const NEW_SITE_URL = "https://intip.inuappcenter.kr";

const BYPASS_STORAGE_KEY = "legacy-host-bypass";

export function isLegacyHost(): boolean {
  return window.location.hostname === LEGACY_HOSTNAME;
}

/** 이 탭(웹뷰)에서 이미 "그래도 들어가기"를 눌렀는지. */
export function isLegacyHostBypassed(): boolean {
  try {
    return window.sessionStorage.getItem(BYPASS_STORAGE_KEY) === "1";
  } catch {
    // 스토리지가 막힌 환경(시크릿·WebView 설정)에서는 매번 안내 화면을 보여준다.
    return false;
  }
}

/** 새로고침·내부 이동으로 안내 화면이 다시 뜨지 않도록 탭 단위로 기억한다. */
export function rememberLegacyHostBypass(): void {
  try {
    window.sessionStorage.setItem(BYPASS_STORAGE_KEY, "1");
  } catch {
    // 기억하지 못해도 이번 진입은 그대로 진행한다.
  }
}
