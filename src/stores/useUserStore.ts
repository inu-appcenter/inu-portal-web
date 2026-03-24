import { TokenInfo, UserInfo, UserInfoInput } from "@/types/members";
import { normalizeUserInfo } from "@/utils/userInfo";
import { create } from "zustand";

interface UserState {
  tokenInfo: TokenInfo;
  userInfo: UserInfo;
  setTokenInfo: (tokenInfo: TokenInfo) => void;
  setUserInfo: (userProfile: UserInfoInput) => void;
  isLoading: boolean;
}

const useUserStore = create<UserState>((set) => ({
  tokenInfo: {
    accessToken: "",
    accessTokenExpiredTime: "",
    refreshToken: "",
    refreshTokenExpiredTime: "",
  },
  userInfo: normalizeUserInfo(),
  isLoading: true, // 초기 상태를 true로 설정

  setTokenInfo: (tokenInfo) => {
    set(() => ({ tokenInfo }));
    localStorage.setItem("tokenInfo", JSON.stringify(tokenInfo));
  },
  setUserInfo: (userInfo) =>
    set(() => ({ userInfo: normalizeUserInfo(userInfo) })),
}));

export default useUserStore;
