import { describe, expect, it } from "vitest";

import {
  compareVersions,
  isAppVersionAtLeast,
  parseAppVersion,
} from "../appVersion";

const IOS_APP =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 INTIPApp/3.0.14";
const ANDROID_APP =
  "Mozilla/5.0 (Linux; Android 14; SM-S918N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0 Mobile Safari/537.36 INTIPApp/3.1.0";
const LEGACY_APP =
  "Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 Chrome/129.0 Mobile Safari/537.36 INTIPApp/1.0.0";
const BROWSER =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1";

describe("parseAppVersion", () => {
  it("UA 끝의 INTIPApp 버전을 꺼낸다", () => {
    expect(parseAppVersion(IOS_APP)).toBe("3.0.14");
    expect(parseAppVersion(ANDROID_APP)).toBe("3.1.0");
  });

  it("앱이 아니면 null", () => {
    expect(parseAppVersion(BROWSER)).toBeNull();
    expect(parseAppVersion("")).toBeNull();
  });
});

describe("compareVersions", () => {
  it("자리별로 숫자 비교한다(문자열 비교가 아니다)", () => {
    expect(compareVersions("3.0.14", "3.0.9")).toBeGreaterThan(0);
    expect(compareVersions("3.0.13", "3.0.14")).toBeLessThan(0);
    expect(compareVersions("3.0.14", "3.0.14")).toBe(0);
    expect(compareVersions("3.1", "3.0.14")).toBeGreaterThan(0);
    expect(compareVersions("3.0", "3.0.0")).toBe(0);
  });
});

describe("isAppVersionAtLeast", () => {
  it("최소 버전 이상인 앱만 true", () => {
    expect(isAppVersionAtLeast("3.0.14", IOS_APP)).toBe(true);
    expect(isAppVersionAtLeast("3.0.14", ANDROID_APP)).toBe(true);
    expect(isAppVersionAtLeast("3.0.14", LEGACY_APP)).toBe(false);
    expect(
      isAppVersionAtLeast("3.0.14", IOS_APP.replace("3.0.14", "3.0.13")),
    ).toBe(false);
  });

  it("브라우저는 false", () => {
    expect(isAppVersionAtLeast("3.0.14", BROWSER)).toBe(false);
  });
});
