import { describe, it, expect } from "vitest";
import { computeTopFadeHeight } from "../MobileHeader";
import { SAFE_AREA } from "../../../../styles/safeArea";

describe("MobileHeader 상단 스크롤 엣지 페이드(Top Edge Fade) 단위 검증", () => {
  it("서브헤더가 없는 일반 헤더의 경우 기본 헤더(64px) + SAFE_AREA.TOP + 페이드 여백(24px)으로 계산되어야 한다", () => {
    const height = computeTopFadeHeight(false);
    expect(height).toBe(`calc(64px + ${SAFE_AREA.TOP} + 24px)`);
  });

  it("서브헤더(탭, 카테고리 등)가 있는 헤더의 경우 서브헤더(126px) + SAFE_AREA.TOP + 페이드 여백(24px)으로 계산되어야 한다", () => {
    const height = computeTopFadeHeight(true);
    expect(height).toBe(`calc(126px + ${SAFE_AREA.TOP} + 24px)`);
  });

  it("SAFE_AREA.TOP에 안드로이드 웹뷰 호환용 --native-safe-area-inset-top 변수가 포함되어야 한다", () => {
    const height = computeTopFadeHeight(false);
    expect(height).toContain("--native-safe-area-inset-top");
  });
});
