import { useEffect, useState, useRef, useMemo } from "react";
import { useLocation, useOutlet } from "react-router-dom";
import styled from "styled-components";
import { AnimatePresence, motion } from "framer-motion";

import { useHeaderConfig } from "@/context/HeaderContext";
import { ROUTES } from "@/constants/routes";
import MobileIntroPage from "@/pages/mobile/MobileIntroPage";
import MobileNav from "@/containers/mobile/common/MobileNav";
import MobileHeader from "@/containers/mobile/common/MobileHeader";

// 메인 탭 경로 정의
const MAIN_PATHS: string[] = [
  ROUTES.HOME,
  ROUTES.BUS.ROOT,
  ROUTES.SAVE,
  ROUTES.MYPAGE.ROOT,
  ROUTES.ROOT,
];

// 컨텐츠 고정 컴포넌트 (마운트 시점 outlet 유지)
const FrozenOutlet = ({ children }: { children: React.ReactNode }) => {
  const [fixedOutlet] = useState(children);
  return <>{fixedOutlet}</>;
};

interface MainLayoutProps {
  showHeader?: boolean;
  showNav?: boolean;
}

export default function MainTabLayout({
  showHeader = true,
  showNav = true,
}: MainLayoutProps) {
  const location = useLocation();
  const outlet = useOutlet();
  const { setIsScrolled } = useHeaderConfig();
  const [showIntro, setShowIntro] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // 현재 경로 상태 관리
  const [lastMainPath, setLastMainPath] = useState(location.pathname);
  const isMainPath = MAIN_PATHS.includes(location.pathname);

  // 애니메이션 키 계산
  const activeKey = useMemo(() => {
    if (isMainPath) return location.pathname;
    return lastMainPath;
  }, [location.pathname, isMainPath, lastMainPath]);

  useEffect(() => {
    if (isMainPath) setLastMainPath(location.pathname);
  }, [location.pathname, isMainPath]);

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
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
    setIsScrolled(false);
  }, [activeKey, setIsScrolled]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop;
    setIsScrolled(scrollTop >= 24);
  };

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
            transition={{ duration: 0.5 }}
          >
            <MobileIntroPage />
          </IntroWrapper>
        ) : (
          <>
            <ScrollArea ref={scrollRef} onScroll={handleScroll}>
              {/* 애니메이션 제외 영역: 헤더 고정 */}
              {showHeader && (
                <HeaderFloating>
                  <MobileHeader targetPath={activeKey as any} />
                </HeaderFloating>
              )}

              <AnimatePresence mode="sync">
                <MotionPage
                  key={activeKey}
                  initial={{ opacity: 0, x: 24, filter: "blur(8px)" }}
                  animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, x: -12, filter: "blur(8px)" }}
                  transition={{
                    duration: 0.25,
                    ease: [0.4, 0, 0.2, 1],
                  }}
                >
                  <ContentArea
                    $paddingTop={headerHeight}
                    $paddingBottom={navHeight}
                  >
                    <FrozenOutlet>{outlet}</FrozenOutlet>
                  </ContentArea>
                </MotionPage>
              </AnimatePresence>
            </ScrollArea>

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
  background: conic-gradient(
    from 85deg at 50.89% 49.77%,
    #cfe9ea 76.62deg,
    #d4e3ef 135.72deg,
    #def 265.16deg,
    #d4e3ef 314.83deg
  );
`;

const ScrollArea = styled.div`
  width: 100%;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  position: relative;
  &::-webkit-scrollbar {
    display: none;
  }
`;

const HeaderFloating = styled.div`
  position: sticky;
  top: 0;
  width: 100%;
  z-index: 100;
  pointer-events: auto;
`;

const MotionPage = styled(motion.div)`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  min-height: 100%;
  display: flex;
  flex-direction: column;
  will-change: transform, opacity, filter;
`;

const ContentArea = styled.div<{ $paddingTop: number; $paddingBottom: number }>`
  width: 100%;
  flex: 1;
  padding-top: ${(props) => props.$paddingTop}px;
  padding-bottom: ${(props) => props.$paddingBottom}px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
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
