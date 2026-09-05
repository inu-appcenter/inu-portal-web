/**
 * 알림을 눌렀을 때 이동할 곳 판정.
 *
 * 서버 `NotificationResponse.path`는 푸시 payload의 `data.path`와 같은 값이다.
 * 네이티브 앱은 시스템 알림 탭에서 이 값으로 이동하므로(intip-mobile-app의
 * `push/navIntent.ts`), 알림함에서도 같은 값을 써야 두 경로가 같은 화면으로 간다.
 *
 * path는 포털 내부 경로(`/home/tips/12`)일 수도, 학교 공지처럼 외부 링크
 * (`https://www.inu.ac.kr/...`)일 수도 있다. 옛 알림이나 path 없이 발송된
 * 알림은 값이 없으므로, 호출부는 `null`을 받으면 기존 type 분기로 폴백한다.
 */
export type NotificationTarget =
  | { kind: "internal"; path: string }
  | { kind: "external"; url: string };

/** 브라우저 밖(테스트·SSR)에서는 비교할 호스트가 없다. */
function currentHost(): string {
  return typeof window === "undefined" ? "" : window.location.host;
}

export function resolveNotificationTarget(
  path?: string | null,
  portalHost: string = currentHost(),
): NotificationTarget | null {
  if (!path) {
    return null;
  }

  const candidate = path.trim();

  if (!candidate) {
    return null;
  }

  // 프로토콜 상대 URL(`//evil.example`)은 내부 경로처럼 생겼지만 외부로 나간다.
  if (candidate.startsWith("//")) {
    return null;
  }

  if (candidate.startsWith("/")) {
    return { kind: "internal", path: candidate };
  }

  let url: URL;

  try {
    url = new URL(candidate);
  } catch {
    // 경로도 URL도 아닌 값. 판정 불가.
    return null;
  }

  // javascript:, data: 등은 열지 않는다.
  if (url.protocol !== "https:" && url.protocol !== "http:") {
    return null;
  }

  // 지금 보고 있는 포털을 가리키는 절대 URL은 새 탭 대신 SPA 이동으로 처리한다.
  if (portalHost && url.host === portalHost) {
    return { kind: "internal", path: url.pathname + url.search + url.hash };
  }

  return { kind: "external", url: url.toString() };
}
