/**
 * 딥링크(Universal Links)로 들어왔지만 앱이 없는 iOS 사용자에게 설치를 유도하는
 * 상단 배너의 노출 정책.
 *
 * iOS Safari는 `index.html`의 `apple-itunes-app` 메타(네이티브 Smart App Banner)가
 * 담당하고, 이 모듈이 다루는 커스텀 배너는 **Smart App Banner가 렌더되지 않는**
 * iOS 환경(크롬·카카오톡·인스타그램 등 인앱 브라우저)만 메꾼다. 둘이 동시에 뜨면
 * 화면 위쪽이 두 겹이 되므로 Safari에서는 커스텀 배너를 내린다.
 *
 * DOM·React에 의존하지 않는 순수 함수로 두어 UA 문자열만으로 단위 테스트한다.
 */
import type { AppEnvironmentStatus } from "./getMobilePlatform";

/** App Store 앱 ID. Smart App Banner 메타(`index.html`)와 같은 값이어야 한다. */
export const APP_STORE_APP_ID = "6740070975";

/** 배너의 '열기' 버튼이 여는 스토어 페이지. */
export const APP_STORE_URL = `https://apps.apple.com/kr/app/id${APP_STORE_APP_ID}`;

/** 배너 높이(px). 헤더/콘텐츠를 밀어내는 계산에도 그대로 쓰인다. */
export const INSTALL_BANNER_HEIGHT = 60;

/** 세션 단위 닫힘 플래그 키. */
export const INSTALL_BANNER_DISMISS_KEY = "intip.installBanner.dismissed";

/**
 * 홈은 기존 설치 유도 바텀시트(`InstallPromotionBottomSheet`)가 이미 담당한다.
 * 같은 화면에서 위·아래로 설치 유도가 두 개 뜨는 걸 막기 위해 제외한다.
 */
const HOME_PATHS = ["/", "/m", "/home", "/m/home", "/home/v2"];

/**
 * iOS에서 Safari가 아님을 알려 주는 UA 마커.
 *
 * 대체 브라우저(CriOS=Chrome, FxiOS=Firefox …)와 인앱 웹뷰(카카오톡·인스타 …)를
 * 한 목록으로 묶는다. 커스텀 배너 입장에서 둘의 처리가 같기 때문 — Smart App
 * Banner를 렌더하는 건 Safari뿐이라, Safari가 아니면 전부 커스텀 배너 대상이다.
 */
const NON_SAFARI_MARKERS = [
  // 대체 브라우저
  "CRIOS",
  "FXIOS",
  "EDGIOS",
  "OPT/",
  "DUCKDUCKGO",
  "WHALE",
  // 인앱 브라우저
  "KAKAOTALK",
  "INSTAGRAM",
  "FBAN",
  "FBAV",
  "LINE/",
  "NAVER",
  "DAUMAPPS",
  "EVERYTIMEAPP",
  "SNAPCHAT",
  "TIKTOK",
  "TWITTER",
];

/** iOS(아이폰/아이팟/아이패드) 기기인지. */
export function isIOSUserAgent(userAgent: string): boolean {
  return /iPhone|iPad|iPod/i.test(userAgent);
}

/**
 * iOS **Safari**인지. Smart App Banner를 렌더하는 유일한 브라우저다.
 *
 * Safari는 `Version/17.0 Mobile/15E148 Safari/604.1`처럼 `Version/`과 `Safari/`를
 * 함께 갖는다. 인앱 웹뷰(WKWebView)는 같은 WebKit이지만 `Version/`이 없고, 대체
 * 브라우저는 자기 마커를 붙이므로 이 둘을 조합하면 갈라진다.
 */
export function isIOSSafari(userAgent: string): boolean {
  if (!isIOSUserAgent(userAgent)) return false;
  const ua = userAgent.toUpperCase();
  if (NON_SAFARI_MARKERS.some((marker) => ua.includes(marker))) return false;
  return ua.includes("SAFARI/") && ua.includes("VERSION/");
}

interface InstallBannerContext {
  userAgent: string;
  /** `getAppEnvironmentStatus()` 결과. 공식 앱 웹뷰면 배너를 띄우지 않는다. */
  appStatus: AppEnvironmentStatus;
  /** 현재 라우트(`location.pathname`). */
  pathname: string;
  /** 이번 세션에서 사용자가 이미 닫았는지. */
  dismissed: boolean;
}

/** 커스텀 상단 설치 배너를 지금 띄워야 하는지. */
export function shouldShowInstallBanner({
  userAgent,
  appStatus,
  pathname,
  dismissed,
}: InstallBannerContext): boolean {
  // 공식 앱 안(신·구버전 모두)에서는 설치를 유도할 이유가 없다.
  if (appStatus !== "BROWSER") return false;
  // 이번 범위는 iOS만. Android는 App Links가 미설치 시 그냥 웹으로 떨어진다.
  if (!isIOSUserAgent(userAgent)) return false;
  // Safari는 네이티브 Smart App Banner가 대신 뜬다.
  if (isIOSSafari(userAgent)) return false;
  if (dismissed) return false;
  if (HOME_PATHS.includes(pathname)) return false;
  return true;
}

/**
 * 세션 닫힘 플래그 읽기/쓰기. 카카오톡 등 일부 인앱 브라우저는 스토리지 접근에
 * SecurityError를 던지므로(`safeStorage.ts`와 같은 이유) 항상 감싸서 접근한다.
 */
export function readBannerDismissed(): boolean {
  try {
    if (typeof window === "undefined" || !window.sessionStorage) return false;
    return sessionStorage.getItem(INSTALL_BANNER_DISMISS_KEY) === "1";
  } catch {
    return false;
  }
}

export function writeBannerDismissed(): void {
  try {
    if (typeof window === "undefined" || !window.sessionStorage) return;
    sessionStorage.setItem(INSTALL_BANNER_DISMISS_KEY, "1");
  } catch {
    /* 스토리지가 막힌 환경에서는 이번 화면에서만 닫힘(상태는 메모리로 유지) */
  }
}
