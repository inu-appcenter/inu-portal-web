/**
 * 모바일 디바이스 및 브라우저 레이아웃 환경에 무관하게
 * 렌더링 리플로우(Reflow) 지연 시간을 고려하여
 * 최상단으로 강건하고 부드럽게 스크롤을 리셋해주는 공통 헬퍼 유틸리티
 */
export const resetScrollToTop = (delay = 50) => {
  setTimeout(() => {
    window.scrollTo({ top: 0 });
    if (typeof document !== "undefined") {
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      const scrollableDiv = document.getElementById("app-scroll-view");
      if (scrollableDiv) {
        scrollableDiv.scrollTop = 0;
      }
    }
  }, delay);
};
