/**
 * 공식 앱 WebView의 User-Agent 끝에 붙는 `INTIPApp/<version>`에서 앱 버전을 읽는다.
 * (intip-mobile-app `APP_UA_SUFFIX` 참고. 버전은 app.json의 `version`)
 *
 * 구버전 앱은 버전 자리에 `1.0.0`을 고정으로 넣었으므로, 버전 비교는
 * "이 버전 이상인 신버전 앱"을 고르는 용도로만 쓴다.
 */

const APP_UA_VERSION_PATTERN = /INTIPApp\/(\d+(?:\.\d+)*)/;

/** UA에서 앱 버전을 꺼낸다. 앱이 아니거나 버전이 없으면 `null`. */
export function parseAppVersion(userAgent: string): string | null {
  return APP_UA_VERSION_PATTERN.exec(userAgent)?.[1] ?? null;
}

/** 점으로 구분된 버전을 비교한다. a가 크면 양수, 작으면 음수, 같으면 0. */
export function compareVersions(a: string, b: string): number {
  const aParts = a.split(".").map(Number);
  const bParts = b.split(".").map(Number);
  const length = Math.max(aParts.length, bParts.length);

  for (let i = 0; i < length; i += 1) {
    const diff = (aParts[i] ?? 0) - (bParts[i] ?? 0);
    if (diff !== 0) return diff;
  }
  return 0;
}

/** 공식 앱이고 버전이 `minVersion` 이상인지. */
export function isAppVersionAtLeast(
  minVersion: string,
  userAgent: string = typeof navigator === "undefined" ? "" : navigator.userAgent,
): boolean {
  const version = parseAppVersion(userAgent);
  return version !== null && compareVersions(version, minVersion) >= 0;
}
