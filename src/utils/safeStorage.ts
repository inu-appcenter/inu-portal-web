/**
 * 카카오톡, 인스타그램 등 일부 인앱 브라우저나 개인정보 보안 설정이 강화된 웹뷰 환경에서
 * localStorage 접근 시 SecurityError (DOMException)가 발생할 수 있습니다.
 * 이에 대비해 안전하게 localStorage에 읽기/쓰기/삭제를 수행하는 헬퍼 함수입니다.
 */

export const safeLocalStorage = {
  getItem(key: string): string | null {
    try {
      if (typeof window === "undefined" || !window.localStorage) return null;
      return localStorage.getItem(key);
    } catch (e) {
      console.warn(`[safeLocalStorage] Failed to get item "${key}":`, e);
      return null;
    }
  },

  setItem(key: string, value: string): void {
    try {
      if (typeof window === "undefined" || !window.localStorage) return;
      localStorage.setItem(key, value);
    } catch (e) {
      console.warn(`[safeLocalStorage] Failed to set item "${key}":`, e);
    }
  },

  removeItem(key: string): void {
    try {
      if (typeof window === "undefined" || !window.localStorage) return;
      localStorage.removeItem(key);
    } catch (e) {
      console.warn(`[safeLocalStorage] Failed to remove item "${key}":`, e);
    }
  },
};
