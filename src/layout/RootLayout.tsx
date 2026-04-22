import { useEffect, useState } from "react";
import { useLocation, useNavigate, useOutlet } from "react-router-dom";
import styled from "styled-components";

import { getMembers, postApiLogs, postFcmToken } from "@/apis/members";
import { HeaderProvider } from "@/context/HeaderContext";
import { ROUTES } from "@/constants/routes";
import { useFeatureFlags } from "@/hooks/useFeatureFlags";
import useAppStateStore from "@/stores/useAppStateStore";
import useUserStore from "@/stores/useUserStore";
import ScrollBarStyles from "@/styles/ScrollBarStyles";
import { trackPageView } from "@/utils/mixpanel";
import {
  getBootstrappedFcmToken,
  getFcmDeviceType,
  saveLastFcmSyncState,
  shouldSyncFcmToken,
  subscribeToFcmToken,
} from "@/utils/fcm";
import { DESKTOP_MEDIA } from "@/styles/responsive";

type MainTabPath = "/" | "/home" | "/save" | "/mypage" | "/bus";

export default function RootLayout() {
  const outlet = useOutlet();
  const navigate = useNavigate();
  const location = useLocation();

  useFeatureFlags();

  const { tokenInfo, userInfo, setTokenInfo, setUserInfo } = useUserStore();
  const { setIsAppUrl } = useAppStateStore();

  const [fcmToken, setFcmToken] = useState<string | null>(() =>
    getBootstrappedFcmToken(),
  );

  useEffect(() => {
    setIsAppUrl(ROUTES.ROOT as MainTabPath);

    const storedTokenInfo = localStorage.getItem("tokenInfo");
    if (storedTokenInfo) {
      setTokenInfo(JSON.parse(storedTokenInfo));
    }
  }, [setIsAppUrl, setTokenInfo]);

  useEffect(() => {
    if (!tokenInfo.accessToken) {
      return;
    }

    void (async () => {
      try {
        const { data } = await getMembers();
        setUserInfo(data);
      } catch (error) {
        console.error("회원 조회 실패", error);
      }
    })();
  }, [setUserInfo, tokenInfo.accessToken]);

  useEffect(() => {
    if (!tokenInfo.accessToken || userInfo.id === 0) {
      return;
    }

    if (userInfo.department == null || userInfo.department === "") {
      if (location.pathname !== ROUTES.MYPAGE.PROFILE) {
        alert("학과 정보 등록이 필요해요. 마이페이지로 이동합니다.");
        navigate(ROUTES.MYPAGE.PROFILE);
      }
      return;
    }

    if (location.pathname === ROUTES.LOGIN) {
      navigate(ROUTES.HOME);
    }
  }, [location.pathname, navigate, tokenInfo.accessToken, userInfo]);

  useEffect(() => {
    const initialToken = getBootstrappedFcmToken();
    if (initialToken) {
      setFcmToken(initialToken);
    }

    return subscribeToFcmToken((token) => {
      setFcmToken((currentToken) => (currentToken === token ? currentToken : token));
    });
  }, []);

  useEffect(() => {
    if (!fcmToken) {
      return;
    }

    const hasPersistedAuth = Boolean(localStorage.getItem("tokenInfo"));
    const isAuthenticated = Boolean(tokenInfo.accessToken);

    if (!isAuthenticated && hasPersistedAuth) {
      return;
    }

    if (!shouldSyncFcmToken(fcmToken, isAuthenticated)) {
      return;
    }

    const deviceType = getFcmDeviceType();

    void (async () => {
      try {
        await postFcmToken(fcmToken, deviceType);

        const log = {
          status: "success",
          timestamp: new Date().toLocaleString(),
          token: fcmToken,
          deviceType,
          authState: isAuthenticated ? "authenticated" : "anonymous",
        };

        saveLastFcmSyncState({
          token: fcmToken,
          isAuthenticated,
          syncedAt: Date.now(),
        });
        localStorage.setItem("fcmSendLog", JSON.stringify(log));
        console.log("FCM 토큰 동기화 성공", log);
      } catch (error) {
        const log = {
          status: "fail",
          timestamp: new Date().toLocaleString(),
          token: fcmToken,
          deviceType,
          authState: isAuthenticated ? "authenticated" : "anonymous",
          error: error instanceof Error ? error.message : String(error),
        };

        localStorage.setItem("fcmSendLog", JSON.stringify(log));
        console.error("FCM 토큰 동기화 실패", error);
      }
    })();
  }, [fcmToken, tokenInfo.accessToken]);

  useEffect(() => {
    const apiCount = async () => {
      const today = new Date().toISOString().split("T")[0];
      if (localStorage.getItem("user_count_date") !== today) {
        await postApiLogs("/api/members/no-dup");
        localStorage.setItem("user_count_date", today);
      }
    };

    void apiCount();
  }, []);

  // 전역 페이지 뷰 추적
  useEffect(() => {
    trackPageView(location.pathname);
  }, [location.pathname]);

  return (
    <HeaderProvider>
      <ScrollBarStyles />
      <ScreenContainer>{outlet}</ScreenContainer>
    </HeaderProvider>
  );
}

const ScreenContainer = styled.div`
  width: 100%;
  margin: 0 auto;
  min-height: 100vh;
  position: relative;
  background-color: #f1f1f3;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.05);

  @media ${DESKTOP_MEDIA} {
    max-width: none;
    box-shadow: none;
  }
`;
