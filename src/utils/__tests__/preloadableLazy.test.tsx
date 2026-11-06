import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import { preloadableLazy } from "../preloadableLazy";

describe("preloadableLazy", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("preload가 완료되면 React.lazy를 거치지 않고 동기 컴포넌트로 즉시 렌더되어야 한다", async () => {
    const DummyComponent = () => createElement("div", null, "사전로드 완료 컨텐츠");
    const factory = vi.fn().mockResolvedValue({ default: DummyComponent });

    const Preloadable = preloadableLazy(factory);

    // 1. 사전 로드 실행
    await Preloadable.preload();
    expect(factory).toHaveBeenCalledTimes(1);

    // 2. 동기 렌더링 검증: preload가 끝났으므로 Suspense 에러 없이 즉시 HTML 문자열로 렌더링됨
    const html = renderToStaticMarkup(createElement(Preloadable));
    expect(html).toContain("사전로드 완료 컨텐츠");
  });

  it("preload가 여러 번 호출되어도 factory는 한 번만 호출되어야 한다", async () => {
    const DummyComponent = () => createElement("div", null, "테스트");
    const factory = vi.fn().mockResolvedValue({ default: DummyComponent });

    const Preloadable = preloadableLazy(factory);

    await Promise.all([Preloadable.preload(), Preloadable.preload(), Preloadable.preload()]);
    expect(factory).toHaveBeenCalledTimes(1);
  });
});
