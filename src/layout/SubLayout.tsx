import { useLocation, useOutlet } from "react-router-dom";
import styled from "styled-components";
import { AnimatePresence, motion } from "framer-motion";
import { HeaderProvider } from "@/context/HeaderContext";
import ScrollBarStyles from "@/resources/styles/ScrollBarStyles";

interface RootLayoutProps {
  showNav?: boolean;
}

export default function SubLayout({ showNav = false }: RootLayoutProps) {
  const location = useLocation();
  const outlet = useOutlet();

  return (
    <HeaderProvider>
      <RootBackground>
        <ScrollBarStyles />
        <AppContainer id="app-scroll-view">
          <AnimatePresence mode="wait">
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
              <ContentWrapper $showNav={showNav}>{outlet}</ContentWrapper>
            </MotionPage>
          </AnimatePresence>
        </AppContainer>
      </RootBackground>
    </HeaderProvider>
  );
}

const RootBackground = styled.div`
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  background: #f1f1f3;
`;

const AppContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
  max-width: 1024px;
  overflow-y: auto; // 실제 스크롤 발생 구역

  @media (max-width: 768px) {
    padding: 0;
  }
`;

const MotionPage = styled(motion.div)`
  width: 100%;
  display: flex;
  flex-direction: column;
  flex: 1;
`;

const ContentWrapper = styled.div<{ $showNav: boolean }>`
  width: 100%;
  padding-bottom: ${(props) => (props.$showNav ? "100px" : "20px")};
  box-sizing: border-box;
`;
