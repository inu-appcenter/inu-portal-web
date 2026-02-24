import { useEffect } from "react";
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

// 허용되는 경로 타입 정의
type MainTabPath = "/" | "/home" | "/save" | "/mypage" | "/bus";

// 메인 탭 경로 목록
const MAIN_PATHS: string[] = [
  ROUTES.HOME,
  ROUTES.BUS.ROOT,
  ROUTES.SAVE,
  ROUTES.MYPAGE.ROOT,
  ROUTES.ROOT,
  ROUTES.TIMETABLE.ROOT,
];

// 페이지 스택 애니메이션 변수
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

  // 토큰 및 초기 경로 설정
  useEffect(() => {
    // [수정] 정의된 MainTabPath 타입으로 단언
    setIsAppUrl(ROUTES.ROOT as MainTabPath);

    const storedToken = localStorage.getItem("tokenInfo");
    if (storedToken) setTokenInfo(JSON.parse(storedToken));
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

  // FCM 토큰 수신 및 접속 로그 기록
  useEffect(() => {
    (window as any).onReceiveFcmToken = async (token: string) => {
      localStorage.setItem("fcmToken", token);
      await tokenInstance.post("/api/tokens", { token });
    };

    const apiCount = async () => {
      const today = new Date().toISOString().split("T")[0];
      if (localStorage.getItem("user_count_date") !== today) {
        await postApiLogs("/api/members/no-dup");
        localStorage.setItem("user_count_date", today);
      }
    };
    apiCount();
    return () => {
      (window as any).onReceiveFcmToken = null;
    };
  }, []);

  // 애니메이션 제어 변수
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

// 최상위 컨테이너
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

// 애니메이션 래퍼
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
