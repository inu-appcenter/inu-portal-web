import axios from "axios";
import useUserStore from "stores/useUserStore";
import { refresh } from "apis/members";

const tokenInstance = axios.create({
  baseURL: "https://portal.inuappcenter.kr/",
});

// 요청 인터셉터 - 토큰 설정
tokenInstance.interceptors.request.use(
  (config) => {
    const { accessToken } = useUserStore.getState().tokenInfo;
    if (accessToken) {
      config.headers["Auth"] = accessToken;
    } else {
      alert("로그인이 필요합니다. 로그인해 주세요.");
      return Promise.reject(
        new axios.Cancel("토큰이 없어 요청이 취소되었습니다.")
      );
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터 - 401 에러 시 토큰 재발급 및 요청 재시도
tokenInstance.interceptors.response.use(
  (response) => {
    // 모든 응답의 response.data.msg 콘솔 출력
    if (response.data && response.data.msg) {
      console.log(response.data.msg);
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true; // 재시도 방지 플래그 설정

      try {
        const { data } = await refresh(); // refresh API로 토큰 재발급
        const newTokenInfo = data; // 새로운 토큰 정보

        // 스토어에 새로운 토큰 정보 저장 (로컬스토리지에도 저장됨)
        useUserStore.getState().setTokenInfo(newTokenInfo);

        // 새로운 토큰을 요청 헤더에 추가하여 원래 요청을 재시도
        tokenInstance.defaults.headers.common["Auth"] =
          newTokenInfo.accessToken;
        originalRequest.headers["Auth"] = newTokenInfo.accessToken;

        return tokenInstance(originalRequest); // 기존 요청 재시도
      } catch (refreshError) {
        // 리프레시 토큰 재발급 실패 시
        alert("로그인 정보가 만료되었습니다. 다시 로그인해 주세요.");
        useUserStore.getState().setTokenInfo({
          accessToken: "",
          accessTokenExpiredTime: "",
          refreshToken: "",
          refreshTokenExpiredTime: "",
        });
        localStorage.removeItem("tokenInfo");
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default tokenInstance;
