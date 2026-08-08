import axios, { AxiosError } from "axios";
import useUserStore from "@/stores/useUserStore";
import { refresh } from "@/apis/members";
import { resetMixpanel } from "@/utils/mixpanel";

const tokenInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

const EMPTY_TOKEN_INFO = {
  accessToken: "",
  accessTokenExpiredTime: "",
  refreshToken: "",
  refreshTokenExpiredTime: "",
};

// 401이 동시에 여러 개 터져도(화면 하나가 쿼리 여러 개를 병렬로 던지는 게 보통이다)
// 재발급은 한 번만 돌리고 나머지는 그 결과를 기다린다. 이게 없으면 요청 수만큼
// refresh를 때리고, 실패 시 요청 수만큼 만료 alert이 쌓인다.
let refreshPromise: Promise<string> | null = null;
// 만료 안내는 로그아웃 1회당 한 번만. 다시 로그인하면 아래 subscribe에서 풀린다.
let hasNotifiedExpiry = false;

const clearAuth = () => {
  resetMixpanel();
  useUserStore.getState().setTokenInfo({ ...EMPTY_TOKEN_INFO });
  localStorage.removeItem("tokenInfo");
  localStorage.removeItem("fcmToken");
};

const notifyExpiredOnce = () => {
  if (hasNotifiedExpiry) return;
  hasNotifiedExpiry = true;
  alert("로그인 정보가 만료되었습니다. 다시 로그인해 주세요.");
};

// 로그인(또는 네이티브발 토큰 동기화)으로 토큰이 다시 생기면 다음 만료 때 또 안내한다.
useUserStore.subscribe((state) => {
  if (state.tokenInfo.accessToken) hasNotifiedExpiry = false;
});

/** 재발급을 단 한 번만 수행하고, 동시 호출자에게는 같은 결과를 나눠준다. */
const refreshAccessToken = () => {
  if (!refreshPromise) {
    refreshPromise = refresh()
      .then(({ data }) => {
        useUserStore.getState().setTokenInfo(data);
        tokenInstance.defaults.headers.common["Auth"] = data.accessToken;
        return data.accessToken;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
};

// 요청 인터셉터 - 토큰 설정
tokenInstance.interceptors.request.use(
  (config) => {
    const { accessToken } = useUserStore.getState().tokenInfo;
    if (accessToken) {
      config.headers["Auth"] = accessToken;
    }
    // else {
    //   alert("로그인이 필요합니다. 로그인해 주세요.");
    //   return Promise.reject(
    //     new axios.Cancel("토큰이 없어 요청이 취소되었습니다.")
    //   );
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
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

      // 이미 로그아웃된 상태(리프레시 토큰 없음)면 재발급을 시도할 것도, 만료를
      // 안내할 것도 없다. 여기서 걸러야 로그아웃 후 남은 요청들이 alert을 다시 띄우지 않는다.
      if (!useUserStore.getState().tokenInfo.refreshToken) {
        (error as AxiosError & { isRefreshError?: boolean }).isRefreshError =
          true;
        return Promise.reject(error);
      }

      try {
        const accessToken = await refreshAccessToken();

        // 새로운 토큰을 요청 헤더에 추가하여 원래 요청을 재시도
        originalRequest.headers["Auth"] = accessToken;

        return tokenInstance(originalRequest); // 기존 요청 재시도
      } catch (refreshError) {
        // 리프레시 토큰 재발급 실패 시
        notifyExpiredOnce();
        clearAuth();

        (
          refreshError as AxiosError & { isRefreshError?: boolean }
        ).isRefreshError = true;
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  },
);

export default tokenInstance;
