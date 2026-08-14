import axios from "axios";
import useUserStore from "@/stores/useUserStore";

// 재발급도 토큰을 발급한 서버(tokenInstance와 동일 오리진)로 보내야 한다.
// 운영 URL을 하드코딩해두면 dev 서버로 로그인한 토큰이 운영에서 거부돼
// 401 → 재발급 실패 → 만료 alert이 계속 뜬다.
const refreshInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
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
  },
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
