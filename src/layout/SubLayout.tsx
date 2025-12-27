import { useLocation, useOutlet } from "react-router-dom";
import styled from "styled-components";
import { AnimatePresence, motion } from "framer-motion";
import { HeaderProvider } from "@/context/HeaderContext";
import ScrollBarStyles from "@/resources/styles/ScrollBarStyles";
import MobileHeader from "@/containers/mobile/common/MobileHeader";

interface SubLayoutProps {
  showHeader?: boolean;
  showNav?: boolean;
}

export default function SubLayout({
  showHeader = true,
  showNav = false,
}: SubLayoutProps) {
  const location = useLocation();
  const outlet = useOutlet();

  return (
    <HeaderProvider>
      <ScrollBarStyles />
      <RootBackground>
        <AppContainer>
          {/* 1. 헤더 전용 애니메이션 영역 (고정 위치 유지) */}
          {showHeader && (
            <HeaderAnimationWrapper>
              <AnimatePresence mode="wait">
                <motion.div
                  key={location.pathname} // 페이지 경로가 바뀔 때마다 애니메이션 실행
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
      </RootBackground>
    </HeaderProvider>
  );
}

const APP_MAX_WIDTH = "768px";

// 헤더의 fixed 속성을 유지하기 위한 래퍼
const HeaderAnimationWrapper = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1001;
  pointer-events: none; // 클릭 이벤트는 내부 실제 헤더가 처리

  & > div {
    pointer-events: auto;
  }
`;

const RootBackground = styled.div`
  width: 100%;
  min-height: 100vh;
  background: #f1f1f3; // 기존 회색 배경 유지
  overflow-x: hidden; // 가로 스크롤 방지
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
  overflow-x: hidden; // 애니메이션 이탈 방지
`;

const MotionPage = styled(motion.div)<{
  $showHeader: boolean;
  $showNav: boolean;
}>`
  width: 100%;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;

  /* 고정 요소 높이 고려 여백 */
  padding-top: ${(props) => (props.$showHeader ? "100px" : "20px")};
  padding-bottom: ${(props) => (props.$showNav ? "140px" : "40px")};

  overflow: visible; // 브라우저 스크롤 허용
`;

const NavSlot = styled.div`
  position: fixed;
  bottom: 0;
  width: 100%;
  max-width: ${APP_MAX_WIDTH};
  height: 140px; // 네비게이션 높이만큼 공간 확보
  z-index: 100;
`;
