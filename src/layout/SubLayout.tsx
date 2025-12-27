import { useEffect } from "react";
import { useLocation, useOutlet, useNavigationType } from "react-router-dom";
import styled from "styled-components";
import { AnimatePresence, motion, Variants } from "framer-motion"; // Variants 추가
import { HeaderProvider, useHeaderState } from "@/context/HeaderContext";
import ScrollBarStyles from "@/resources/styles/ScrollBarStyles";
import MobileHeader from "@/containers/mobile/common/MobileHeader";

interface SubLayoutProps {
  showHeader?: boolean;
  showNav?: boolean;
}

// Variants 타입 명시 및 cubic-bezier 배열 타입 고정
const stackVariants: Variants = {
  initial: (direction: number) => ({
    x: direction > 0 ? "100%" : "-30%",
    opacity: direction > 0 ? 1 : 0.8,
    zIndex: direction > 0 ? 2 : 1,
  }),
  animate: {
    x: 0,
    opacity: 1,
    zIndex: 1,
    transition: {
      duration: 0.4,
      ease: [0.33, 1, 0.68, 1], // 타입 추론 해결
    },
  },
  exit: (direction: number) => ({
    x: direction > 0 ? "-30%" : "100%",
    opacity: direction > 0 ? 0 : 1,
    zIndex: direction > 0 ? 0 : 2,
    transition: {
      duration: 0.4,
      ease: [0.33, 1, 0.68, 1], // 타입 추론 해결
    },
  }),
};

function SubLayoutContent({
  showHeader = true,
  showNav = false,
}: SubLayoutProps) {
  const location = useLocation();
  const outlet = useOutlet();
  const navType = useNavigationType();
  const { subHeader } = useHeaderState();

  // 스크롤 제어: 뒤로가기(POP)가 아닐 때만 상단 이동
  useEffect(() => {
    if (navType !== "POP") {
      window.scrollTo(0, 0);
    }
  }, [location.pathname, navType]);

  const direction = navType === "POP" ? -1 : 1;

  return (
    <AppContainer>
      {showHeader && (
        <HeaderAnimationWrapper>
          <AnimatePresence mode="popLayout" initial={false} custom={direction}>
            <HeaderMotionWrapper
              key={location.pathname}
              custom={direction}
              variants={stackVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <MobileHeader />
            </HeaderMotionWrapper>
          </AnimatePresence>
        </HeaderAnimationWrapper>
      )}

      <ContentArea>
        <AnimatePresence mode="popLayout" initial={false} custom={direction}>
          <MotionPage
            key={location.pathname}
            $showHeader={showHeader}
            $showNav={showNav}
            $hasSubHeader={!!subHeader}
            custom={direction}
            variants={stackVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            {outlet}
          </MotionPage>
        </AnimatePresence>
      </ContentArea>

      {showNav && <NavSlot />}
    </AppContainer>
  );
}

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

// --- Styles ---

const APP_MAX_WIDTH = "768px";

const HeaderAnimationWrapper = styled.div`
  position: fixed;
  top: 0;
  /* 중앙 정렬 */
  left: 50%;
  transform: translateX(-50%);

  width: 100%;
  max-width: ${APP_MAX_WIDTH};

  /* 가로 애니메이션만 마스킹 */
  overflow-x: hidden;
  overflow-y: visible;

  /* 헤더/서브헤더 높이를 고려한 충분한 높이 (브라우저 스크롤에 영향 없음) */
  height: 200px;

  z-index: 1001;
  /* 하위 요소 외에는 클릭/스크롤 이벤트 통과 */
  pointer-events: none;
`;

const HeaderMotionWrapper = styled(motion.div)`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  background: #ffffff;
  /* 실제 버튼 등 인터랙션 허용 */
  pointer-events: auto;
  backface-visibility: hidden;
  transform: translateZ(0);
  will-change: transform, opacity;
`;

const ContentArea = styled.div`
  width: 100%;
  position: relative;
  /* 가로 애니메이션 마스킹 */
  overflow-x: hidden;
  min-height: 100vh;

  overflow-y: hidden;
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

const MotionPage = styled(motion.div)<{
  $showHeader: boolean;
  $showNav: boolean;
  $hasSubHeader: boolean;
}>`
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  background: #f1f1f3;
  backface-visibility: hidden;
  transform: translateZ(0);
  will-change: transform, opacity;

  padding-top: ${(props) => {
    if (!props.$showHeader) return "20px";
    return props.$hasSubHeader ? "140px" : "100px";
  }};

  padding-bottom: ${(props) => (props.$showNav ? "140px" : "40px")};
`;

const NavSlot = styled.div`
  position: fixed;
  bottom: 0;
  width: 100%;
  max-width: ${APP_MAX_WIDTH};
  height: 140px;
  z-index: 100;
`;
