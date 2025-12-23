import { useLocation, useOutlet } from "react-router-dom";
import styled from "styled-components";
import { AnimatePresence, motion } from "framer-motion";

import MobileHeader from "@/containers/mobile/common/MobileHeader";
import { HeaderProvider } from "@/context/HeaderContext";
import ScrollBarStyles from "@/resources/styles/ScrollBarStyles";

interface RootLayoutProps {
  showHeader?: boolean;
  showNav?: boolean;
}

export default function SubLayout({
  showHeader = true,
  showNav = false,
}: RootLayoutProps) {
  const location = useLocation();
  const outlet = useOutlet();

  return (
    <HeaderProvider>
      <RootBackground>
        <ScrollBarStyles />
        <AppContainer id="app-scroll-view">
          <AnimatePresence mode="sync">
            <MotionPage
              key={location.pathname}
              initial={{ opacity: 0, x: 24, filter: "blur(8px)" }}
              animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, x: -12, filter: "blur(8px)" }}
              transition={{
                duration: 0.25,
                ease: [0.4, 0.0, 0.2, 1],
              }}
            >
              {showHeader && (
                <HeaderWrapper>
                  <MobileHeader />
                </HeaderWrapper>
              )}
              <ContentWrapper $showNav={showNav}>{outlet}</ContentWrapper>
            </MotionPage>
          </AnimatePresence>
        </AppContainer>
      </RootBackground>
    </HeaderProvider>
  );
}

// 스타일 정의
const RootBackground = styled.div`
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  background: #f1f1f3;
  //background: conic-gradient(
  //  from 85deg at 50.89% 49.77%,
  //  #cfe9ea 76.62456929683685deg,
  //  #d4e3ef 135.7189178466797deg,
  //  #def 265.1615309715271deg,
  //  #d4e3ef 314.8280382156372deg
  //);
`;

const AppContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
  max-width: 1024px;
  overflow-y: auto;

  @media (max-width: 768px) {
    padding: 0;
  }
`;

const HeaderWrapper = styled.div`
  position: sticky;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 100;
`;

const MotionPage = styled(motion.div)`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 2;
`;

const ContentWrapper = styled.div<{ $showNav: boolean }>`
  width: 100%;
  padding-top: 10px;
  padding-bottom: ${(props) => (props.$showNav ? "100px" : "20px")};
  box-sizing: border-box;
`;
