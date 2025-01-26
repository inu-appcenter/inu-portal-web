// src/global.d.ts
declare global {
  interface Window {
    kakao: any; // kakao 객체를 any로 정의
    AndroidBridge: {
      navigateTo: (destination: string, url: string) => void;
    };
  }
}

export {};
