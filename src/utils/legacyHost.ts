/**
 * 구 배포 도메인 차단 판정.
 *
 * `intip-test.pages.dev`는 예전 Cloudflare Pages 기본 도메인으로, 현재 서비스 주소는
 * `intip.inuappcenter.kr`이다. 앱(WebView)이 예전 주소를 물고 켜지는 경우가 있어
 * 리다이렉트 대신 사용을 막고 앱 재시작을 안내한다(리다이렉트는 캐시·딥링크 상태가
 * 섞여 더 헷갈리는 화면이 나온다).
 */
export const LEGACY_HOSTNAME = "intip-test.pages.dev";

export const NEW_SITE_URL = "https://intip.inuappcenter.kr";

export function isLegacyHost(): boolean {
  return window.location.hostname === LEGACY_HOSTNAME;
}
