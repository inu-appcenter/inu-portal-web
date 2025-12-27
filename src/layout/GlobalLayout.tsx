import { ROUTES } from "@/constants/routes";
import { useLocation, useOutlet } from "react-router-dom";
import { useEffect, useState } from "react";
import styled from "styled-components";
import { AnimatePresence, motion } from "framer-motion";

import useUserStore from "@/stores/useUserStore";
import useAppStateStore from "@/stores/useAppStateStore";
import { getMembers, postApiLogs } from "@/apis/members";
import tokenInstance from "@/apis/tokenInstance";

import MobileIntroPage from "@/pages/mobile/MobileIntroPage";
import ScrollBarStyles from "@/resources/styles/ScrollBarStyles";
import MobileNav from "@/containers/mobile/common/MobileNav";
import MobileHeader from "@/containers/mobile/common/MobileHeader";
import { HeaderProvider } from "@/context/HeaderContext";

interface RootLayoutProps {
  showHeader?: boolean;
  showNav?: boolean;
}

export default function RootLayout({
  showHeader = true,
  showNav = false,
}: RootLayoutProps) {
  const location = useLocation();
  const outlet = useOutlet();

  const { tokenInfo, setTokenInfo, setUserInfo } = useUserStore();
  const { setIsAppUrl } = useAppStateStore();
  const [showIntro, setShowIntro] = useState(false);

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

  useEffect(() => {
    setIsAppUrl(ROUTES.ROOT);
    const storedToken = localStorage.getItem("tokenInfo");
    if (storedToken) setTokenInfo(JSON.parse(storedToken));
  }, [setTokenInfo, setIsAppUrl]);

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

  return (
    <HeaderProvider>
      <ScrollBarStyles />
      <RootBackground>
        <AppContainer>
          <AnimatePresence mode="wait">
            {showIntro ? (
              <IntroWrapper
                key="intro"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                <MobileIntroPage />
              </IntroWrapper>
            ) : (
              <>
                {/* 헤더: fixed로 화면 상단 고정 */}
                {showHeader && <MobileHeader />}

                <ContentArea>
                  <AnimatePresence mode="popLayout">
                    <MotionPage
                      key={location.pathname}
                      $showHeader={showHeader}
                      $showNav={showNav}
                      initial={{ opacity: 0, x: 24, filter: "blur(8px)" }}
                      animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                      exit={{ opacity: 0, x: -12, filter: "blur(8px)" }}
                      transition={{
                        duration: 0.25,
                        ease: [0.4, 0.0, 0.2, 1],
                      }}
                    >
                      {outlet}
                    </MotionPage>
                  </AnimatePresence>
                </ContentArea>

                {/* 네비게이션: fixed로 화면 하단 고정 */}
                {showNav && <MobileNav />}
              </>
            )}
          </AnimatePresence>
        </AppContainer>
      </RootBackground>
    </HeaderProvider>
  );
}

const APP_MAX_WIDTH = "768px";

// ... 기존 import 동일

const RootBackground = styled.div`
  width: 100%;
  min-height: 100vh;
  background: conic-gradient(
    from 85deg at 50.89% 49.77%,
    #cfe9ea 76.62deg,
    #d4e3ef 135.72deg,
    #def 265.16deg,
    #d4e3ef 314.83deg
  );
  background-attachment: fixed;

  /* [핵심 1] 브라우저 수준에서 가로 스크롤만 차단 */
  overflow-x: hidden;
`;

const AppContainer = styled.div`
  width: 100%;
  max-width: ${APP_MAX_WIDTH};
  margin: 0 auto;
  min-height: 100vh;
  position: relative;
  /* 내부 overflow 설정을 제거하여 브라우저 스크롤이 끝까지 전달되게 함 */
`;

const ContentArea = styled.div`
  width: 100%;
  position: relative;
  overflow-y: hidden;
  /* [핵심 2] 애니메이션 중인 요소가 컨테이너 밖으로 나갈 때 스크롤바 생성 방지 */
  /* hidden 대신 clip을 사용하면 더 깔끔하지만, 호환성을 위해 hidden 유지 */
  overflow-x: hidden;
`;

const MotionPage = styled(motion.div)<{
  $showHeader: boolean;
  $showNav: boolean;
}>`
  width: 100%;
  /* [핵심 3] 높이를 고정하지 않음으로써 브라우저 전체 높이에 맞게 늘어남 */
  display: flex;
  flex-direction: column;
  box-sizing: border-box;

  /* 고정 헤더/네비 여백 유지 */
  padding-top: ${(props) => (props.$showHeader ? "100px" : "20px")};
  padding-bottom: ${(props) => (props.$showNav ? "140px" : "40px")};

  /* 내부 스크롤 관련 속성 절대 금지 (이중 스크롤의 원인) */
  overflow: visible;
`;

const IntroWrapper = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  z-index: 1000;
`;
