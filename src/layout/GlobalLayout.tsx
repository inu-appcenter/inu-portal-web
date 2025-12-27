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
import { HeaderProvider, useHeaderState } from "@/context/HeaderContext"; // useHeaderState 추가

interface RootLayoutProps {
  showHeader?: boolean;
  showNav?: boolean;
}

// 1. 컨텍스트를 사용하는 내부 콘텐츠 컴포넌트 분리
function RootLayoutContent({
  showHeader = true,
  showNav = false,
}: RootLayoutProps) {
  const location = useLocation();
  const outlet = useOutlet();

  // Header 상태 구독
  const { subHeader } = useHeaderState();

  const { tokenInfo, setTokenInfo, setUserInfo } = useUserStore();
  const { setIsAppUrl } = useAppStateStore();
  const [showIntro, setShowIntro] = useState(false);

  // --- 기존 useEffect 로직 유지 ---
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
                  $hasSubHeader={!!subHeader} // subHeader 유무 전달
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

// 2. 메인 Export 컴포넌트 (Provider로 감싸기)
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

  /* 동적 padding-top: subHeader 여부에 따라 높이 조절 */
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
