import { useEffect, useState } from "react";
import { useLocation, useNavigationType, useOutlet } from "react-router-dom";
import { AnimatePresence, motion, Variants } from "framer-motion";
import styled from "styled-components";

import { ROUTES } from "@/constants/routes";
import useUserStore from "@/stores/useUserStore";
import useAppStateStore from "@/stores/useAppStateStore";
import { getMembers, postApiLogs } from "@/apis/members";
import tokenInstance from "@/apis/tokenInstance";
import ScrollBarStyles from "@/styles/ScrollBarStyles";
import { HeaderProvider } from "@/context/HeaderContext";

type MainTabPath = "/" | "/home" | "/save" | "/mypage" | "/bus";

const MAIN_PATHS: string[] = [
  ROUTES.HOME,
  ROUTES.BUS.ROOT,
  ROUTES.SAVE,
  ROUTES.MYPAGE.ROOT,
  ROUTES.ROOT,
  ROUTES.TIMETABLE.ROOT,
];

const stackVariants: Variants = {
  initial: (direction: number) => ({
    x: direction > 0 ? "100%" : "-20%",
    opacity: 1,
    zIndex: direction > 0 ? 2 : 1,
    filter: "blur(0px)",
  }),
  animate: {
    x: 0,
    opacity: 1,
    zIndex: 1,
    filter: "blur(0px)",
    transition: {
      duration: 0.35,
      ease: [0.33, 1, 0.68, 1],
    },
  },
  exit: (direction: number) => ({
    x: direction > 0 ? "-20%" : "100%",
    opacity: 1,
    zIndex: direction > 0 ? 0 : 2,
    filter: direction > 0 ? "brightness(0.8)" : "brightness(1)",
    transition: {
      duration: 0.35,
      ease: [0.33, 1, 0.68, 1],
    },
  }),
};

export default function RootLayout() {
  const location = useLocation();
  const outlet = useOutlet();
  const navType = useNavigationType();

  const { tokenInfo, setTokenInfo, setUserInfo } = useUserStore();
  const { setIsAppUrl } = useAppStateStore();

  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const LAST_SENT_TOKEN_KEY = "lastSentFcmToken";

  // =========================
  // 토큰 및 초기 경로 설정
  // =========================
  useEffect(() => {
    setIsAppUrl(ROUTES.ROOT as MainTabPath);

    const storedToken = localStorage.getItem("tokenInfo");
    if (storedToken) {
      setTokenInfo(JSON.parse(storedToken));
    }
  }, [setTokenInfo, setIsAppUrl]);

  // =========================
  // 사용자 데이터 동기화
  // =========================
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

  // =========================
  // WebView FCM 수신 등록
  // =========================
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

  // =========================
  // 앱 토큰 우선 전략 (fallback 포함)
  // =========================
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

  // =========================
  // 토큰 변경 시 서버 동기화
  // =========================
  useEffect(() => {
    const syncToken = async () => {
      if (!fcmToken) return;
      if (!tokenInfo.accessToken) return; // 로그인 상태에서만

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
  }, [fcmToken, tokenInfo.accessToken]);

  // =========================
  // 접속 로그
  // =========================
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

  const isMainTab = MAIN_PATHS.includes(location.pathname);
  const animationKey = isMainTab ? "MAIN_TAB_GROUP" : location.pathname;
  const direction = navType === "POP" ? -1 : 1;

  return (
    <HeaderProvider>
      <ScrollBarStyles />
      <ScreenContainer>
        <AnimatePresence mode="popLayout" initial={false} custom={direction}>
          <MotionPageWrapper
            key={animationKey}
            custom={direction}
            variants={stackVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            {outlet}
          </MotionPageWrapper>
        </AnimatePresence>
      </ScreenContainer>
    </HeaderProvider>
  );
}

const APP_MAX_WIDTH = "768px";

const ScreenContainer = styled.div`
  width: 100%;
  height: 100vh;
  height: 100dvh;
  max-width: ${APP_MAX_WIDTH};
  margin: 0 auto;
  position: relative;
  overflow: hidden;
  background-color: #f1f1f3;
`;

const MotionPageWrapper = styled(motion.div)`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #f1f1f3;
  box-shadow: -10px 0 20px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;
