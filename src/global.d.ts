// src/global.d.ts
declare global {
  interface Window {
    kakao: any; // kakao 객체를 any로 정의
    AndroidBridge: {
      navigateTo?: (destination: string, url: string) => void;
      goBack?: () => void;
      handleLogout?: () => void;
    };
    webkit?: {
      messageHandlers?: Record<string, { postMessage: (message: any) => void }>;
    };
  }
}

export {};
