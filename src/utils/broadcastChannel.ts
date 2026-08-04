/**
 * BroadcastChannel 미지원 환경(구형 WebView 등)에서도 안전하게 no-op(null)로
 * 동작하도록 감싼 팩토리. 채널 하나당 정확히 하나의 인스턴스를 만들어 쓰는
 * 소유자(zustand 미들웨어, QueryClient 동기화 등)를 위한 것으로, 별도의
 * 참조 카운팅 없이 소유자가 직접 생명주기를 관리한다.
 */
export function createSafeBroadcastChannel(name: string): BroadcastChannel | null {
  if (typeof window === "undefined" || !("BroadcastChannel" in window)) {
    return null;
  }

  try {
    return new BroadcastChannel(name);
  } catch (error) {
    console.warn(`[broadcastChannel] BroadcastChannel(${name}) 생성 실패`, error);
    return null;
  }
}
