import { useLocation, useOutlet } from "react-router-dom";
import styled from "styled-components";
import { AnimatePresence, motion } from "framer-motion";
import { HeaderProvider, useHeaderState } from "@/context/HeaderContext"; // useHeaderState 추가
import ScrollBarStyles from "@/resources/styles/ScrollBarStyles";
import MobileHeader from "@/containers/mobile/common/MobileHeader";

interface SubLayoutProps {
  showHeader?: boolean;
  showNav?: boolean;
}

// 컨텍스트 값 참조를 위한 내부 콘텐츠 컴포넌트
function SubLayoutContent({
  showHeader = true,
  showNav = false,
}: SubLayoutProps) {
  const location = useLocation();
  const outlet = useOutlet();
  const { subHeader } = useHeaderState(); // 현재 subHeader 존재 여부 확인

  return (
    <AppContainer>
      {showHeader && (
        <HeaderAnimationWrapper>
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, x: 20, filter: "blur(8px)" }}
              animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, x: -20, filter: "blur(8px)" }}
              transition={{ duration: 0.25, ease: [0.4, 0.0, 0.2, 1] }}
            >
              <MobileHeader />
            </motion.div>
          </AnimatePresence>
        </HeaderAnimationWrapper>
      )}

      <ContentArea>
        <AnimatePresence mode="popLayout">
          <MotionPage
            key={location.pathname}
            $showHeader={showHeader}
            $showNav={showNav}
            $hasSubHeader={!!subHeader} // subHeader 존재 여부 전달
            initial={{ opacity: 0, x: 20, filter: "blur(8px)" }}
            animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, x: -20, filter: "blur(8px)" }}
            transition={{ duration: 0.25, ease: [0.4, 0.0, 0.2, 1] }}
          >
            {outlet}
          </MotionPage>
        </AnimatePresence>
      </ContentArea>

      {showNav && <NavSlot />}
    </AppContainer>
  );
}

// 메인 Export 컴포넌트
export default function SubLayout(props: SubLayoutProps) {
  return (
    <HeaderProvider>
      <ScrollBarStyles />
      <RootBackground>
        <SubLayoutContent {...props} />
      </RootBackground>
    </HeaderProvider>
  );
}

// --- Styles ---

const APP_MAX_WIDTH = "768px";

const HeaderAnimationWrapper = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1001;
  pointer-events: none;

  & > div {
    pointer-events: auto;
  }
`;

const RootBackground = styled.div`
  width: 100%;
  min-height: 100vh;
  background: #f1f1f3;
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
  overflow-x: hidden;
`;

const MotionPage = styled(motion.div)<{
  $showHeader: boolean;
  $showNav: boolean;
  $hasSubHeader: boolean; // 추가된 prop 타입
}>`
  width: 100%;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;

  /* 헤더 및 서브헤더 유무에 따른 동적 패딩 설정 */
  padding-top: ${(props) => {
    if (!props.$showHeader) return "20px";
    return props.$hasSubHeader ? "120px" : "100px"; // subHeader 있을 때 150px로 확장
  }};

  padding-bottom: ${(props) => (props.$showNav ? "140px" : "40px")};

  overflow: visible;
`;

const NavSlot = styled.div`
  position: fixed;
  bottom: 0;
  width: 100%;
  max-width: ${APP_MAX_WIDTH};
  height: 140px;
  z-index: 100;
`;
