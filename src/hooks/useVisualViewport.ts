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

    // iOS에서 키보드가 올라올 때 전체 화면이 밀리는 현상을 방지하기 위해 body 스크롤 잠금
    const originalStyle = window.getComputedStyle(document.body).overflow;
    const originalHeight = document.body.style.height;
    const originalPosition = document.body.style.position;

    if (window.visualViewport) {
      document.body.style.overflow = "hidden";
      document.body.style.height = "100%";
      // document.body.style.position = "fixed"; // 필요시 주석 해제
    }

    const handleVisualViewportChange = () => {
      const vv = window.visualViewport!;
      const height = vv.height;
      const offsetTop = vv.offsetTop;

      setViewportHeight(height);

      // CSS 변수 업데이트
      document.documentElement.style.setProperty(
        "--visual-viewport-height",
        `${height}px`,
      );
      document.documentElement.style.setProperty(
        "--visual-viewport-offset-top",
        `${offsetTop}px`,
      );

      // iOS에서 입력창 포커스 시 브라우저가 강제로 스크롤하는 것을 방지
      if (offsetTop > 0) {
        window.scrollTo(0, 0);
      }
    };

    window.visualViewport.addEventListener("resize", handleVisualViewportChange);
    window.visualViewport.addEventListener("scroll", handleVisualViewportChange);

    handleVisualViewportChange();

    return () => {
      window.visualViewport?.removeEventListener(
        "resize",
        handleVisualViewportChange,
      );
      window.visualViewport?.removeEventListener(
        "scroll",
        handleVisualViewportChange,
      );
      // 스타일 복구
      document.body.style.overflow = originalStyle;
      document.body.style.height = originalHeight;
      document.body.style.position = originalPosition;
    };
  }, []);

  return viewportHeight;
};
