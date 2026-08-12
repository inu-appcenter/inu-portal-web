import { useEffect, useState } from "react";
import { useLocation, useNavigate, useOutlet } from "react-router-dom";
import styled from "styled-components";

import { getMembers, postApiLogs, postFcmToken } from "@/apis/members";
import { ROUTES } from "@/constants/routes";
import { HeaderProvider } from "@/context/HeaderContext";
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
import AIChatFloatingButton from "@/components/common/AIChatFloatingButton";
import { getAppEnvironmentStatus } from "@/utils/getMobilePlatform";
import AppUpdateModal from "@/components/common/AppUpdateModal";
import AppInstallBanner from "@/components/common/AppInstallBanner";
import { safeLocalStorage } from "@/utils/safeStorage";


type MainTabPath = "/" | "/home" | "/save" | "/mypage" | "/bus";

export default function RootLayout() {
  const outlet = useOutlet();
  const navigate = useNavigate();
  const location = useLocation();

  useFeatureFlags();

  const { tokenInfo, userInfo, setUserInfo } = useUserStore();
  const { setIsAppUrl } = useAppStateStore();

  const [fcmToken, setFcmToken] = useState<string | null>(() =>
    getBootstrappedFcmToken(),
  );

  useEffect(() => {
    setIsAppUrl(ROUTES.ROOT as MainTabPath);
  }, [setIsAppUrl]);

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

    const hasPersistedAuth = Boolean(safeLocalStorage.getItem("tokenInfo"));
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
        safeLocalStorage.setItem("fcmSendLog", JSON.stringify(log));
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

        safeLocalStorage.setItem("fcmSendLog", JSON.stringify(log));
        console.error("FCM 토큰 동기화 실패", error);
      }
    })();
  }, [fcmToken, tokenInfo.accessToken]);

  useEffect(() => {
    const apiCount = async () => {
      const today = new Date().toISOString().split("T")[0];
      if (safeLocalStorage.getItem("user_count_date") !== today) {
        await postApiLogs("/api/members/no-dup");
        safeLocalStorage.setItem("user_count_date", today);
      }
    };

    void apiCount();
  }, []);

  // 전역 페이지 뷰 추적
  useEffect(() => {
    trackPageView(location.pathname);
  }, [location.pathname]);

  const appStatus = getAppEnvironmentStatus();
  const forceUpdateEnabled = import.meta.env.VITE_FORCE_UPDATE_ENABLED === "true";

  if (appStatus === "OLD_APP" && forceUpdateEnabled) {
    return <AppUpdateModal />;
  }

  return (
    <HeaderProvider>
      <ScrollBarStyles />
      {/* 앱 미설치 iOS 사용자용 설치 유도 배너. 노출 조건은 컴포넌트 안에서
          판단하고, 해당 없으면 아무것도 렌더하지 않는다. */}
      <AppInstallBanner />
      <ScreenContainer>
        {outlet}
        {(location.pathname === ROUTES.HOME ||
          location.pathname === ROUTES.MOBILE_HOME ||
          location.pathname === ROUTES.HOME_V2 ||
          location.pathname === ROUTES.ROOT) && <AIChatFloatingButton />}
      </ScreenContainer>
    </HeaderProvider>
  );
}

const ScreenContainer = styled.div`

  width: 100%;
  margin: 0 auto;
  min-height: 100vh;
  position: relative;
  background: var(--bg-subtle, #F8F9FB);

  box-shadow: 0 0 20px rgba(0, 0, 0, 0.05);

  @media ${DESKTOP_MEDIA} {
    max-width: none;
    box-shadow: none;
  }
`;
