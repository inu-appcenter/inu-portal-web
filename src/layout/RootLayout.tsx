import { useEffect, useState } from "react";
import { useLocation, useNavigate, useOutlet } from "react-router-dom";
import styled from "styled-components";

import { ROUTES } from "@/constants/routes";
import useUserStore from "@/stores/useUserStore";
import useAppStateStore from "@/stores/useAppStateStore";
import { getMembers, postApiLogs, postFcmToken } from "@/apis/members";
import ScrollBarStyles from "@/styles/ScrollBarStyles";
import { HeaderProvider } from "@/context/HeaderContext";

type MainTabPath = "/" | "/home" | "/save" | "/mypage" | "/bus";

export default function RootLayout() {
  const outlet = useOutlet();
  const navigate = useNavigate();
  const location = useLocation();

  const { tokenInfo, userInfo, setTokenInfo, setUserInfo } = useUserStore();
  const { setIsAppUrl } = useAppStateStore();

  const [fcmToken, setFcmToken] = useState<string | null>(null);
  // const LAST_SENT_TOKEN_KEY = "lastSentFcmToken";

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

  // 학과 정보 여부에 따른 리다이렉트 처리
  useEffect(() => {
    if (tokenInfo.accessToken && userInfo.id !== 0) {
      if (userInfo.department == null || userInfo.department === "") {
        if (location.pathname !== ROUTES.MYPAGE.PROFILE) {
          alert("학과 정보 등록이 필요해요. 마이페이지로 이동합니다.");
          navigate(ROUTES.MYPAGE.PROFILE);
        }
      } else if (location.pathname === ROUTES.LOGIN) {
        navigate(ROUTES.HOME);
      }
    }
  }, [tokenInfo.accessToken, userInfo, location.pathname, navigate]);

  // 웹뷰 FCM 수신 등록
  useEffect(() => {
    (window as any).onReceiveFcmToken = (token: string) => {
      // 빈 값이나 공백만 올 경우 무시 (제대로 된 값이 올 때까지 대기)
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
        if (savedToken && savedToken.trim() !== "") {
          setFcmToken(savedToken);
        }
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [fcmToken]);

  // 토큰 서버 동기화
  useEffect(() => {
    const syncToken = async () => {
      // 유효한 토큰이 없으면 전송하지 않음 (대기 상태)
      if (!fcmToken || fcmToken.trim() === "") return;

      try {
        // 앱 실행 시마다 무조건 전송하도록 중복 체크(lastSent) 로직 제거
        await postFcmToken(fcmToken);
        const log = {
          status: "success",
          timestamp: new Date().toLocaleString(),
          token: fcmToken,
        };
        localStorage.setItem("fcmSendLog", JSON.stringify(log));
        console.log("FCM 토큰 동기화 성공", log);
      } catch (error) {
        const log = {
          status: "fail",
          timestamp: new Date().toLocaleString(),
          error: error instanceof Error ? error.message : String(error),
        };
        localStorage.setItem("fcmSendLog", JSON.stringify(log));
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
