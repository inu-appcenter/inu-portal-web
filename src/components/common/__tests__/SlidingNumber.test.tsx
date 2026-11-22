import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import SlidingNumber from "../SlidingNumber";

describe("SlidingNumber 컴포넌트", () => {
  it("정수값을 올바른 aria-label과 0~9 트랙과 함께 렌더링해야 한다", () => {
    const html = renderToStaticMarkup(<SlidingNumber value={96} />);
    expect(html).toContain('aria-label="96"');
    expect(html).toContain("96");
    expect(html).toContain("translateY(-90%)");
    expect(html).toContain("translateY(-60%)");
  });

  it("소수점 및 기호가 포함된 문자열을 올바르게 렌더링해야 한다", () => {
    const html = renderToStaticMarkup(<SlidingNumber value="3.85" />);
    expect(html).toContain('aria-label="3.85"');
    expect(html).toContain(".");
    expect(html).toContain("translateY(-30%)");
    expect(html).toContain("translateY(-80%)");
    expect(html).toContain("translateY(-50%)");
  });

  it("0 또는 단일 숫자를 넘겨도 크래시 없이 정상 렌더링되어야 한다", () => {
    const html = renderToStaticMarkup(<SlidingNumber value={0} />);
    expect(html).toContain('aria-label="0"');
    expect(html).toContain("translateY(-0%)");
  });
});
