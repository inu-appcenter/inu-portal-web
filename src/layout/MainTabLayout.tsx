import { useEffect, useState, useMemo } from "react";
import { useLocation, useOutlet } from "react-router-dom";
import styled from "styled-components";
import { AnimatePresence, motion } from "framer-motion";

import { ROUTES } from "@/constants/routes";
import MobileIntroPage from "@/pages/mobile/MobileIntroPage";
import MobileNav from "@/containers/mobile/common/MobileNav";
import MobileHeader from "@/containers/mobile/common/MobileHeader";
import PageScrollWrapper from "@/components/common/PageScrollWrapper";

const MAIN_PATHS: string[] = [
  ROUTES.HOME,
  ROUTES.BUS.ROOT,
  ROUTES.SAVE,
  ROUTES.MYPAGE.ROOT,
  ROUTES.ROOT,
  ROUTES.TIMETABLE,
];

const FrozenOutlet = ({ children }: { children: React.ReactNode }) => {
  const [fixedOutlet] = useState(children);
  return <>{fixedOutlet}</>;
};

export default function MainTabLayout({
  showHeader = true,
  showNav = true,
}: {
  showHeader?: boolean;
  showNav?: boolean;
}) {
  const location = useLocation();
  const outlet = useOutlet();
  const [showIntro, setShowIntro] = useState(false);

  const [lastMainPath, setLastMainPath] = useState(location.pathname);
  const isMainPath = MAIN_PATHS.includes(location.pathname);

  const activeKey = useMemo(() => {
    if (isMainPath) return location.pathname;
    return lastMainPath;
  }, [location.pathname, isMainPath, lastMainPath]);

  useEffect(() => {
    if (isMainPath) setLastMainPath(location.pathname);
  }, [location.pathname, isMainPath]);

  useEffect(() => {
    const introShown = sessionStorage.getItem("introShown");
    if (!introShown) {
      sessionStorage.setItem("introShown", "true");
      setShowIntro(true);
      setTimeout(() => setShowIntro(false), 1000);
    }
  }, []);

  const headerHeight = showHeader ? 100 : 20;
  const navHeight = showNav ? 100 : 40;

  return (
    <LayoutContainer>
      <AnimatePresence mode="wait">
        {showIntro ? (
          <IntroWrapper
            key="intro"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <MobileIntroPage />
          </IntroWrapper>
        ) : (
          <>
            <AnimatePresence mode="sync" initial={false}>
              <MotionPage
                key={activeKey}
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
              >
                {/* isActive: 현재 URL과 레이아웃 키가 일치할 때만 스크롤 ID 부여 및 로직 가동 */}
                <PageScrollWrapper
                  isActive={location.pathname === activeKey}
                  id="app-scroll-view"
                >
                  {showHeader && (
                    <HeaderFloating>
                      <MobileHeader targetPath={activeKey as any} />
                    </HeaderFloating>
                  )}
                  <ContentArea $pt={headerHeight} $pb={navHeight}>
                    <FrozenOutlet>{outlet}</FrozenOutlet>
                  </ContentArea>
                </PageScrollWrapper>
              </MotionPage>
            </AnimatePresence>

            {showNav && (
              <NavFloating>
                <MobileNav />
              </NavFloating>
            )}
          </>
        )}
      </AnimatePresence>
    </LayoutContainer>
  );
}

const LayoutContainer = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  background: conic-gradient(
    from 85deg at 50.89% 49.77%,
    #cfe9ea 76.62deg,
    #d4e3ef 135.72deg,
    #def 265.16deg,
    #d4e3ef 314.83deg
  );
`;

const MotionPage = styled(motion.div)`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
`;

const ContentArea = styled.div<{ $pt: number; $pb: number }>`
  width: 100%;
  min-height: 100%;
  padding-top: ${(props) => props.$pt}px;
  padding-bottom: ${(props) => props.$pb}px;
  box-sizing: border-box;
`;

const HeaderFloating = styled.div`
  position: sticky;
  top: 0;
  width: 100%;
  z-index: 100;
`;

const NavFloating = styled.div`
  position: absolute;
  bottom: 0;
  width: 100%;
  z-index: 100;
`;

const IntroWrapper = styled(motion.div)`
  position: absolute;
  top: 0;
  width: 100%;
  height: 100%;
  z-index: 2000;
  background-color: #fff;
`;
