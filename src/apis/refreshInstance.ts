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

// 응답 인터셉터
refreshInstance.interceptors.response.use((response) => {
  // 모든 응답의 response.data.msg 콘솔 출력
  if (response.data && response.data.msg) {
    console.log(response.data.msg);
  }
  return response;
});

export default refreshInstance;
