import { describe, expect, it } from "vitest";

import {
  isIOSSafari,
  isIOSUserAgent,
  shouldShowInstallBanner,
} from "../appInstallBanner";

const UA = {
  iosSafari:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1",
  iosChrome:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/125.0.6422.80 Mobile/15E148 Safari/604.1",
  iosKakao:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 KAKAOTALK 10.5.0",
  iosInstagram:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram 331.0.0.37.90 (iPhone14,2; iOS 17_5; ko_KR)",
  androidChrome:
    "Mozilla/5.0 (Linux; Android 14; SM-S911N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Mobile Safari/537.36",
  macSafari:
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15",
} as const;

const base = {
  appStatus: "BROWSER",
  pathname: "/friend/invite/ABC123",
  dismissed: false,
} as const;

describe("isIOSUserAgent", () => {
  it("아이폰 계열만 iOS로 본다", () => {
    expect(isIOSUserAgent(UA.iosSafari)).toBe(true);
    expect(isIOSUserAgent(UA.iosKakao)).toBe(true);
    expect(isIOSUserAgent(UA.androidChrome)).toBe(false);
    expect(isIOSUserAgent(UA.macSafari)).toBe(false);
  });
});

describe("isIOSSafari", () => {
  it("iOS Safari만 참", () => {
    expect(isIOSSafari(UA.iosSafari)).toBe(true);
  });

  it("Safari/ 토큰을 달고 오는 iOS 크롬은 거짓", () => {
    expect(isIOSSafari(UA.iosChrome)).toBe(false);
  });

  it("Version/ 이 없는 인앱 웹뷰는 거짓", () => {
    expect(isIOSSafari(UA.iosKakao)).toBe(false);
    expect(isIOSSafari(UA.iosInstagram)).toBe(false);
  });

  it("데스크톱 Safari는 iOS가 아니므로 거짓", () => {
    expect(isIOSSafari(UA.macSafari)).toBe(false);
  });
});

describe("shouldShowInstallBanner", () => {
  it("iOS 인앱/대체 브라우저에서 뜬다", () => {
    expect(
      shouldShowInstallBanner({ ...base, userAgent: UA.iosKakao }),
    ).toBe(true);
    expect(
      shouldShowInstallBanner({ ...base, userAgent: UA.iosInstagram }),
    ).toBe(true);
    expect(
      shouldShowInstallBanner({ ...base, userAgent: UA.iosChrome }),
    ).toBe(true);
  });

  it("iOS Safari는 네이티브 Smart App Banner가 담당하므로 뜨지 않는다", () => {
    expect(
      shouldShowInstallBanner({ ...base, userAgent: UA.iosSafari }),
    ).toBe(false);
  });

  it("공식 앱 웹뷰 안에서는 뜨지 않는다", () => {
    expect(
      shouldShowInstallBanner({
        ...base,
        userAgent: UA.iosKakao,
        appStatus: "NEW_APP",
      }),
    ).toBe(false);
    expect(
      shouldShowInstallBanner({
        ...base,
        userAgent: UA.iosKakao,
        appStatus: "OLD_APP",
      }),
    ).toBe(false);
  });

  it("Android·데스크톱은 이번 범위가 아니다", () => {
    expect(
      shouldShowInstallBanner({ ...base, userAgent: UA.androidChrome }),
    ).toBe(false);
    expect(
      shouldShowInstallBanner({ ...base, userAgent: UA.macSafari }),
    ).toBe(false);
  });

  it("이번 세션에서 닫았으면 다시 뜨지 않는다", () => {
    expect(
      shouldShowInstallBanner({
        ...base,
        userAgent: UA.iosKakao,
        dismissed: true,
      }),
    ).toBe(false);
  });

  it("홈은 기존 설치 유도 바텀시트가 담당하므로 제외한다", () => {
    for (const pathname of ["/", "/m", "/home", "/m/home", "/home/v2"]) {
      expect(
        shouldShowInstallBanner({ ...base, userAgent: UA.iosKakao, pathname }),
      ).toBe(false);
    }
  });
});
