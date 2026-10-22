import { describe, it, expect } from "vitest";
import {
  SAFE_AREA,
  safeBottom,
  safeTop,
  PAGE_BOTTOM_SAFE_PADDING,
  FLOATING_BUTTON_SAFE_BOTTOM,
  FIXED_BOTTOM_SAFE_PADDING,
} from "../safeArea";

describe("Safe Area 헬퍼 및 토큰 무결성 검증", () => {
  it("Android WebView 호환성을 위한 --native-safe-area-inset-* 변수가 1순위로 포함되어야 한다", () => {
    expect(SAFE_AREA.TOP).toContain("--native-safe-area-inset-top");
    expect(SAFE_AREA.BOTTOM).toContain("--native-safe-area-inset-bottom");
    expect(SAFE_AREA.LEFT).toContain("--native-safe-area-inset-left");
    expect(SAFE_AREA.RIGHT).toContain("--native-safe-area-inset-right");
  });

  it("모바일 브라우저 및 iOS 표준 지원을 위한 env(safe-area-inset-*) 폴백이 포함되어야 한다", () => {
    expect(SAFE_AREA.TOP).toContain("env(safe-area-inset-top, 0px)");
    expect(SAFE_AREA.BOTTOM).toContain("env(safe-area-inset-bottom, 0px)");
  });

  it("safeBottom은 베이스 여백과 결합된 calc 문자열을 정확히 반환해야 한다", () => {
    expect(safeBottom(24)).toBe(
      "calc(24px + var(--native-safe-area-inset-bottom, env(safe-area-inset-bottom, 0px)))"
    );
    expect(safeBottom(0)).toBe(SAFE_AREA.BOTTOM);
  });

  it("safeTop은 상단 여백과 결합된 calc 문자열을 정확히 반환해야 한다", () => {
    expect(safeTop(12)).toBe(
      "calc(12px + var(--native-safe-area-inset-top, env(safe-area-inset-top, 0px)))"
    );
    expect(safeTop(0)).toBe(SAFE_AREA.TOP);
  });

  it("표준 프리셋 상수들이 올바른 규격을 만족해야 한다", () => {
    expect(PAGE_BOTTOM_SAFE_PADDING).toBe(`calc(36px + ${SAFE_AREA.BOTTOM})`);
    expect(FLOATING_BUTTON_SAFE_BOTTOM).toBe(`calc(24px + ${SAFE_AREA.BOTTOM})`);
    expect(FIXED_BOTTOM_SAFE_PADDING).toBe(`calc(16px + ${SAFE_AREA.BOTTOM})`);
  });
});
