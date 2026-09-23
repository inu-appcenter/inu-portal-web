/**
 * INTIP 앱 열기(딥링크) 및 스토어 이동 유틸리티
 */

const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=inu.appcenter.intip_android";
const APP_STORE_URL = "https://apps.apple.com/app/id6740070975?l=ko";

export function openIntipAppOrStore(targetPath?: string) {
  const isAndroid = /android/i.test(navigator.userAgent);
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);

  const cleanPath = targetPath ? targetPath.replace(/^\//, "") : "";
  const deepLink = cleanPath ? `intipmobileapp://${cleanPath}` : "intipmobileapp://";
  const storeUrl = isAndroid ? PLAY_STORE_URL : APP_STORE_URL;

  // 1. 모바일 기기 브라우저인 경우 딥링크 시도 후 스토어로 폴백
  if (isAndroid || isIOS) {
    const startTime = Date.now();
    window.location.href = deepLink;

    setTimeout(() => {
      // 1.5초 이내에 화면이 전환되지 않았으면 앱이 미설치된 상태로 간주하여 스토어로 이동
      if (Date.now() - startTime < 2000) {
        window.location.href = storeUrl;
      }
    }, 1200);
    return;
  }

  // 2. PC / 기타 환경인 경우 안내 알림 또는 스토어 링크
  window.open(storeUrl, "_blank", "noopener,noreferrer");
}
