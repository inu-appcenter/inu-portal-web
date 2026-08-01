// 모델(apis/*.ts) 레이어에서 네트워크 호출 대신 목 데이터를 반환할지 여부.
// `.env.mock`(VITE_MOCK_API=true) + `npm run dev:mock`로만 켜지며, 일반 dev/build에는 영향 없음.
export const isMockApiEnabled = (): boolean =>
  import.meta.env.VITE_MOCK_API === "true";

// react-query의 로딩 상태를 화면에서 확인할 수 있도록 약간의 지연을 흉내낸다.
export const mockDelay = (ms = 200): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));
