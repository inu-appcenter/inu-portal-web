import { TokenInfo, UserInfo, UserInfoInput } from "@/types/members";
import { normalizeUserInfo } from "@/utils/userInfo";
import { create } from "zustand";
import { identifyUser } from "@/utils/mixpanel";
import { bridgeChannel } from "@/utils/bridgeChannel";
import { broadcastSync } from "@/stores/middleware/broadcastSync";

import { safeLocalStorage } from "@/utils/safeStorage";

interface UserState {
  tokenInfo: TokenInfo;
  userInfo: UserInfo;
  setTokenInfo: (tokenInfo: TokenInfo, options?: { fromNative?: boolean }) => void;
  setUserInfo: (userProfile: UserInfoInput) => void;
  isLoading: boolean;
}

const getInitialToken = () => {
  const stored = safeLocalStorage.getItem("tokenInfo");
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      return {
        accessToken: "",
        accessTokenExpiredTime: "",
        refreshToken: "",
        refreshTokenExpiredTime: "",
      };
    }
  }
  return {
    accessToken: "",
    accessTokenExpiredTime: "",
    refreshToken: "",
    refreshTokenExpiredTime: "",
  };
};

const useUserStore = create<UserState>()(
  broadcastSync<UserState>({
    // RN 멀티 웹뷰 환경에서 로그인 화면이 별도 WebView(네이티브 스택 push)로
    // 뜨는 경우, 그 웹뷰에서 로그인해도 이전 화면의 useUserStore는 in-memory
    // 상태라 갱신되지 않는다(새로고침/앱 재시작해야만 localStorage를 다시 읽어
    // 살아남). 이 채널로 tokenInfo/userInfo 변경을 다른 웹뷰에도 즉시 반영한다.
    name: "user-store-sync",
    partialize: (state) => ({ tokenInfo: state.tokenInfo, userInfo: state.userInfo }),
    onReceive: (partial) => {
      if (partial.tokenInfo) {
        safeLocalStorage.setItem("tokenInfo", JSON.stringify(partial.tokenInfo));
      }
    },
  })((set) => ({
    tokenInfo: getInitialToken(),
    userInfo: normalizeUserInfo(),
    isLoading: false, // 초기화 완료됨

    setTokenInfo: (tokenInfo, options) => {
      set(() => ({ tokenInfo }));
      safeLocalStorage.setItem("tokenInfo", JSON.stringify(tokenInfo));

    // 네이티브 셸(intip-mobile-app)로 JWT를 미러링해 SecureStore에 보관시킨다 —
    // 백그라운드 FCM 토큰 등록 등 네이티브가 웹뷰 없이 자체적으로 API를 호출해야
    // 하는 시점의 인증에 쓰인다. fromNative=true(네이티브가 자체 리프레시한 값을
    // echo-back으로 적용하는 경우)면 재전송을 생략해 무한 루프 없이 최대 1회
    // echo에서 자연 종료된다.
    if (bridgeChannel && !options?.fromNative) {
      // @ts-ignore
      (bridgeChannel as any).send("syncTokenInfo", tokenInfo);
    }
  },
  setUserInfo: (userInfo) => {
    const normalized = normalizeUserInfo(userInfo);
    set(() => ({ userInfo: normalized }));

      // Mixpanel 사용자 식별
      if (normalized.id) {
        identifyUser(String(normalized.id), {
          nickname: normalized.nickname,
          department: normalized.department,
          memberId: normalized.id,
          role: normalized.role,
        });
      }
    },
  })),
);

// 네이티브가 자체 리프레시(백그라운드 FCM 토큰 등록 등)한 JWT를 store/localStorage에 반영.
// (bridgeChannel.ts가 아닌 여기서 결선: bridgeChannel.ts → useUserStore.ts 순환 참조를
// 피해야 broadcastSync가 store 생성 시점에 bridgeChannel을 참조해도 TDZ 에러가 나지 않는다.)
if (bridgeChannel) {
  bridgeChannel.on("tokenInfoUpdated", (tokenInfo) => {
    useUserStore.getState().setTokenInfo(tokenInfo, { fromNative: true });
  });
}

export default useUserStore;
