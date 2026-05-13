import { useEffect, useState } from "react";

/**
 * 모바일 브라우저의 가상 키보드 대응을 위해 Visual Viewport의 높이를 감지하고
 * --visual-viewport-height CSS 변수를 업데이트하는 훅입니다.
 */
export const useVisualViewport = () => {
  const [viewportHeight, setViewportHeight] = useState<number>(
    window.visualViewport?.height || window.innerHeight,
  );

  useEffect(() => {
    if (!window.visualViewport) return;

    const handleResize = () => {
      const height = window.visualViewport?.height || window.innerHeight;
      setViewportHeight(height);
      // CSS 변수로 설정하여 스타일에서 직접 사용할 수 있게 함
      document.documentElement.style.setProperty(
        "--visual-viewport-height",
        `${height}px`,
      );
    };

    window.visualViewport.addEventListener("resize", handleResize);
    window.visualViewport.addEventListener("scroll", handleResize);

    // 초기 실행
    handleResize();

    return () => {
      window.visualViewport?.removeEventListener("resize", handleResize);
      window.visualViewport?.removeEventListener("scroll", handleResize);
    };
  }, []);

  return viewportHeight;
};
