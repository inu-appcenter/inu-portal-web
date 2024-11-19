import axios from "axios";
import useUserStore from "stores/useUserStore";

const refreshInstance = axios.create({
  baseURL: "https://portal.inuappcenter.kr/",
});

// 요청 인터셉터 - 토큰 설정
refreshInstance.interceptors.request.use(
  (config) => {
    const { refreshToken } = useUserStore.getState().tokenInfo;
    if (refreshToken) {
      config.headers["refresh"] = refreshToken;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default refreshInstance;
