import { describe, it, expect } from "vitest";
import { computeTopFadeHeight } from "../MobileHeader";
import { SAFE_AREA } from "../../../../styles/safeArea";

describe("MobileHeader 상단 스크롤 엣지 페이드(Top Edge Fade) 단위 검증", () => {
  it("상단 페이드 높이는 핸드폰 상태바 규격(SAFE_AREA.TOP + 16px)으로 콤팩트하게 계산되어야 한다", () => {
    const height = computeTopFadeHeight();
    expect(height).toBe(`calc(${SAFE_AREA.TOP} + 16px)`);
  });

  it("SAFE_AREA.TOP에 안드로이드 웹뷰 호환용 --native-safe-area-inset-top 변수가 포함되어야 한다", () => {
    const height = computeTopFadeHeight();
    expect(height).toContain("--native-safe-area-inset-top");
  });
});
