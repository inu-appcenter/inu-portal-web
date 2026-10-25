import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import AutoMarquee from "../AutoMarquee";

describe("AutoMarquee 컴포넌트", () => {
  it("문자열 텍스트를 정상적으로 렌더링해야 한다", () => {
    const html = renderToStaticMarkup(
      <AutoMarquee text="인천대학교자연과학대학(송도글로벌캠퍼스방면)" />,
    );
    expect(html).toContain("인천대학교자연과학대학(송도글로벌캠퍼스방면)");
  });

  it("빈 문자열을 넘겨도 오류 없이 렌더링되어야 한다", () => {
    const html = renderToStaticMarkup(<AutoMarquee text="" />);
    expect(html).toBeDefined();
  });
});
