import { useEffect, useState, useRef } from "react";
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

  // [수정] state 타입을 string으로 명시하여 location.pathname 할당 허용
  const [frozenPath, setFrozenPath] = useState<string>(location.pathname);

  useEffect(() => {
    // MAIN_PATHS 포함 여부 확인 후 업데이트
    if (MAIN_PATHS.includes(location.pathname)) {
      setFrozenPath(location.pathname);
    }
  }, [location.pathname]);

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
  }, [frozenPath, setIsScrolled]);

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
            <ScrollArea
              ref={scrollRef}
              onScroll={handleScroll}
              $paddingTop={0}
              $paddingBottom={0}
            >
              <AnimatePresence mode="popLayout">
                <FadePage
                  key={frozenPath}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  style={{
                    width: "100%",
                    minHeight: "100%",
                    position: "relative",
                  }}
                >
                  {showHeader && (
                    <div
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        zIndex: 100,
                        pointerEvents: "none",
                      }}
                    >
                      <div style={{ pointerEvents: "auto" }}>
                        {/* [수정] MobileHeader의 targetPath 타입 요구사항에 맞춰 단언 */}
                        <MobileHeader targetPath={frozenPath as any} />
                      </div>
                    </div>
                  )}

                  <div
                    style={{
                      paddingTop: headerHeight,
                      paddingBottom: navHeight,
                      minHeight: "100%",
                    }}
                  >
                    {outlet}
                  </div>
                </FadePage>
              </AnimatePresence>
            </ScrollArea>

            {showNav && (
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  width: "100%",
                  zIndex: 100,
                  pointerEvents: "none",
                }}
              >
                <div style={{ pointerEvents: "auto" }}>
                  <MobileNav />
                </div>
              </div>
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

const ScrollArea = styled.div<{ $paddingTop: number; $paddingBottom: number }>`
  width: 100%;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  box-sizing: border-box;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const FadePage = styled(motion.div)`
  width: 100%;
`;

const IntroWrapper = styled(motion.div)`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 2000;
  background-color: #fff;
`;
