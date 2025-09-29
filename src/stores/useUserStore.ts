import { TokenInfo, UserInfo } from "types/members";
import { create } from "zustand";

interface UserState {
  tokenInfo: TokenInfo;
  userInfo: UserInfo;
  setTokenInfo: (tokenInfo: TokenInfo) => void;
  setUserInfo: (userProfile: UserInfo) => void;
  isLoading: boolean;
}

const useUserStore = create<UserState>((set) => ({
  tokenInfo: {
    accessToken: "",
    accessTokenExpiredTime: "",
    refreshToken: "",
    refreshTokenExpiredTime: "",
  },
  userInfo: {
    id: 0,
    nickname: "",
    department: "",
    fireId: 0,
    role: "",
  },
  isLoading: true, // 초기 상태를 true로 설정

  setTokenInfo: (tokenInfo) => {
    set(() => ({ tokenInfo }));
    localStorage.setItem("tokenInfo", JSON.stringify(tokenInfo));
  },
  setUserInfo: (userInfo) => set(() => ({ userInfo })),
}));

export default useUserStore;
