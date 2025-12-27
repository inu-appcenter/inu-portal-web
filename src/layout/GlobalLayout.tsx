import { ROUTES } from "@/constants/routes";
import { useLocation, useOutlet, useNavigationType } from "react-router-dom"; // useNavigationType 추가
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
import { HeaderProvider, useHeaderState } from "@/context/HeaderContext";

interface RootLayoutProps {
  showHeader?: boolean;
  showNav?: boolean;
}

function RootLayoutContent({
  showHeader = true,
  showNav = false,
}: RootLayoutProps) {
  const location = useLocation();
  const outlet = useOutlet();
  const navType = useNavigationType(); // 내비게이션 타입 감지

  const { subHeader } = useHeaderState();
  const { tokenInfo, setTokenInfo, setUserInfo } = useUserStore();
  const { setIsAppUrl } = useAppStateStore();
  const [showIntro, setShowIntro] = useState(false);

  // 페이지 이동 시 스크롤 상단 이동 제어
  useEffect(() => {
    if (navType !== "POP") {
      window.scrollTo(0, 0);
    }
  }, [location.pathname, navType]);

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
            {showHeader && <MobileHeader />}

            <ContentArea>
              <AnimatePresence mode="popLayout">
                <MotionPage
                  key={location.pathname}
                  $showHeader={showHeader}
                  $showNav={showNav}
                  $hasSubHeader={!!subHeader}
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

            {showNav && <MobileNav />}
          </>
        )}
      </AnimatePresence>
    </AppContainer>
  );
}

export default function RootLayout(props: RootLayoutProps) {
  return (
    <HeaderProvider>
      <ScrollBarStyles />
      <RootBackground>
        <RootLayoutContent {...props} />
      </RootBackground>
    </HeaderProvider>
  );
}

const APP_MAX_WIDTH = "768px";

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
  overflow-x: hidden;
`;

const AppContainer = styled.div`
  width: 100%;
  max-width: ${APP_MAX_WIDTH};
  margin: 0 auto;
  min-height: 100vh;
  position: relative;
`;

const ContentArea = styled.div`
  width: 100%;
  position: relative;
  overflow-y: hidden;
  overflow-x: hidden;
`;

const MotionPage = styled(motion.div)<{
  $showHeader: boolean;
  $showNav: boolean;
  $hasSubHeader: boolean;
}>`
  width: 100%;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;

  padding-top: ${(props) => {
    if (!props.$showHeader) return "20px";
    return props.$hasSubHeader ? "150px" : "100px";
  }};

  padding-bottom: ${(props) => (props.$showNav ? "140px" : "40px")};
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
