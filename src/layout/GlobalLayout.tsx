import { ROUTES } from "@/constants/routes";
import { Outlet, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import styled from "styled-components";
import useUserStore from "@/stores/useUserStore";
import useAppStateStore from "@/stores/useAppStateStore";
import { getMembers, postApiLogs } from "@/apis/members";
import tokenInstance from "@/apis/tokenInstance";
import MobileIntroPage from "@/pages/mobile/MobileIntroPage";
import ScrollBarStyles from "@/resources/styles/ScrollBarStyles";

export default function GlobalLayout() {
  const location = useLocation();
  const { tokenInfo, setTokenInfo, setUserInfo, userInfo } = useUserStore();
  const { setIsAppUrl } = useAppStateStore();
  const [showIntro, setShowIntro] = useState(true);

  // 인트로 표시 여부 확인
  useEffect(() => {
    const introShown = sessionStorage.getItem("introShown");
    if (introShown) {
      setShowIntro(false);
    } else {
      sessionStorage.setItem("introShown", "true");
      const timer = setTimeout(() => setShowIntro(false), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  // 앱 URL 상태 설정
  useEffect(() => {
    setIsAppUrl(ROUTES.ROOT);
  }, [setIsAppUrl]);

  // URL 쿼리 토큰 추출 및 저장
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const accessToken = queryParams.get("token");

    if (accessToken) {
      setTokenInfo({
        accessToken: accessToken,
        accessTokenExpiredTime: "",
        refreshToken: "",
        refreshTokenExpiredTime: "",
      });
    }
  }, [location.search, setTokenInfo]);

  // 로컬스토리지 토큰 복구
  useEffect(() => {
    const storedTokenInfo = localStorage.getItem("tokenInfo");
    if (storedTokenInfo) {
      setTokenInfo(JSON.parse(storedTokenInfo));
    }
  }, [setTokenInfo]);

  // 회원 정보 조회
  useEffect(() => {
    const initializeUser = async () => {
      try {
        const response = await getMembers();
        setUserInfo(response.data);
      } catch (error) {
        console.error("회원 가져오기 실패", error);
      }
    };

    if (tokenInfo.accessToken) {
      initializeUser();
    }
  }, [tokenInfo, setUserInfo]);

  // FCM 토큰 처리
  useEffect(() => {
    (window as any).onReceiveFcmToken = async function (token: string) {
      try {
        localStorage.setItem("fcmToken", token);
        await tokenInstance.post("/api/tokens", { token });
      } catch (error) {
        console.error("FCM 토큰 등록 실패", error);
      }
    };

    return () => {
      (window as any).onReceiveFcmToken = null;
    };
  }, [userInfo]);

  // 접속 유저 카운팅
  useEffect(() => {
    const apiCount = async () => {
      const STORAGE_KEY = "user_count_date";
      const today = new Date().toISOString().split("T")[0];
      const lastCountDate = localStorage.getItem(STORAGE_KEY);

      if (lastCountDate !== today) {
        await postApiLogs("/api/members/no-dup");
        localStorage.setItem(STORAGE_KEY, today);
      }
    };
    apiCount();
  }, []);

  return (
    <RootBackground>
      <ScrollBarStyles />
      <AppContainer>
        {showIntro && <MobileIntroPage />}
        <Outlet />
      </AppContainer>
    </RootBackground>
  );
}
const RootBackground = styled.div`
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  overflow: hidden;

  /* 배경 그라데이션 고정 */
  background: conic-gradient(
    from 85deg at 50.89% 49.77%,
    #cfe9ea 76.62456929683685deg,
    #d4e3ef 135.7189178466797deg,
    #def 265.1615309715271deg,
    #d4e3ef 314.8280382156372deg
  );
`;

const AppContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;

  max-width: 1024px;

  @media (max-width: 768px) {
    padding: 0;
  }
`;
