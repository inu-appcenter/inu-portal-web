import { TokenInfo, UserInfo, UserInfoInput } from "@/types/members";
import { normalizeUserInfo } from "@/utils/userInfo";
import { create } from "zustand";
import { identifyUser } from "@/utils/mixpanel";
import { bridgeChannel } from "@/utils/bridgeChannel";

interface UserState {
  tokenInfo: TokenInfo;
  userInfo: UserInfo;
  setTokenInfo: (tokenInfo: TokenInfo, options?: { fromNative?: boolean }) => void;
  setUserInfo: (userProfile: UserInfoInput) => void;
  isLoading: boolean;
}

const getInitialToken = () => {
  const stored = localStorage.getItem("tokenInfo");
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

const useUserStore = create<UserState>((set) => ({
  tokenInfo: getInitialToken(),
  userInfo: normalizeUserInfo(),
  isLoading: false, // 초기화 완료됨

  setTokenInfo: (tokenInfo, options) => {
    set(() => ({ tokenInfo }));
    localStorage.setItem("tokenInfo", JSON.stringify(tokenInfo));

    // 네이티브 셸(intip-mobile-app)로 JWT를 미러링해 SecureStore에 보관시킨다 —
    // 백그라운드 FCM 토큰 등록 등 네이티브가 웹뷰 없이 자체적으로 API를 호출해야
    // 하는 시점의 인증에 쓰인다. fromNative=true(네이티브가 자체 리프레시한 값을
    // echo-back으로 적용하는 경우)면 재전송을 생략해 무한 루프 없이 최대 1회
    // echo에서 자연 종료된다.
    if (bridgeChannel && !options?.fromNative) {
      bridgeChannel.send("syncTokenInfo", tokenInfo);
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
}));

export default useUserStore;
