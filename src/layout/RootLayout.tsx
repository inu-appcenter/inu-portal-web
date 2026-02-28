import { useEffect, useState } from "react";
import { useOutlet } from "react-router-dom";
import styled from "styled-components";

import { ROUTES } from "@/constants/routes";
import useUserStore from "@/stores/useUserStore";
import useAppStateStore from "@/stores/useAppStateStore";
import { getMembers, postApiLogs } from "@/apis/members";
import tokenInstance from "@/apis/tokenInstance";
import ScrollBarStyles from "@/styles/ScrollBarStyles";
import { HeaderProvider } from "@/context/HeaderContext";

type MainTabPath = "/" | "/home" | "/save" | "/mypage" | "/bus";

export default function RootLayout() {
  const outlet = useOutlet();

  const { tokenInfo, setTokenInfo, setUserInfo } = useUserStore();
  const { setIsAppUrl } = useAppStateStore();

  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const LAST_SENT_TOKEN_KEY = "lastSentFcmToken";

  // 토큰 및 초기 경로 설정
  useEffect(() => {
    setIsAppUrl(ROUTES.ROOT as MainTabPath);

    const storedToken = localStorage.getItem("tokenInfo");
    if (storedToken) {
      setTokenInfo(JSON.parse(storedToken));
    }
  }, [setTokenInfo, setIsAppUrl]);

  // 사용자 데이터 동기화
  useEffect(() => {
    if (tokenInfo.accessToken) {
      (async () => {
        try {
          const { data } = await getMembers();
          setUserInfo(data);
        } catch (e) {
          console.error("회원 조회 실패", e);
        }
      })();
    }
  }, [tokenInfo.accessToken, setUserInfo]);

  // 웹뷰 FCM 수신 등록
  useEffect(() => {
    (window as any).onReceiveFcmToken = (token: string) => {
      if (!token || token.trim() === "") return;

      localStorage.setItem("fcmToken", token);
      setFcmToken(token);
    };

    return () => {
      (window as any).onReceiveFcmToken = null;
    };
  }, []);

  // 앱 토큰 우선 전략
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!fcmToken) {
        const savedToken = localStorage.getItem("fcmToken");
        if (savedToken) {
          setFcmToken(savedToken);
        }
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [fcmToken]);

  // 토큰 서버 동기화
  useEffect(() => {
    const syncToken = async () => {
      if (!fcmToken) return;

      const lastSent = localStorage.getItem(LAST_SENT_TOKEN_KEY);
      if (lastSent === fcmToken) return;

      try {
        await tokenInstance.post("/api/tokens", { token: fcmToken });
        localStorage.setItem(LAST_SENT_TOKEN_KEY, fcmToken);
      } catch (error) {
        console.error("FCM 토큰 동기화 실패", error);
      }
    };

    syncToken();
  }, [fcmToken]);

  // 접속 로그
  useEffect(() => {
    const apiCount = async () => {
      const today = new Date().toISOString().split("T")[0];
      if (localStorage.getItem("user_count_date") !== today) {
        await postApiLogs("/api/members/no-dup");
        localStorage.setItem("user_count_date", today);
      }
    };
    apiCount();
  }, []);

  return (
    <HeaderProvider>
      <ScrollBarStyles />
      <ScreenContainer>{outlet}</ScreenContainer>
    </HeaderProvider>
  );
}

const ScreenContainer = styled.div`
  width: 100%;
  max-width: 768px;
  margin: 0 auto;
  min-height: 100vh;
  position: relative;
  background-color: #f1f1f3;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.05);
`;
