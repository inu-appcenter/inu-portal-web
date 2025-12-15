import { useLocation, useOutlet } from "react-router-dom";
import styled from "styled-components";
import { AnimatePresence, motion } from "framer-motion";
import MobileNav from "@/containers/mobile/common/MobileNav";
import MobileHeader from "@/containers/mobile/common/MobileHeader";

export default function MainLayout() {
  const location = useLocation();
  const outlet = useOutlet();

  return (
    <Container>
      {/* Header에 z-index를 주어 애니메이션 위로 오게 함 */}
      <HeaderWrapper>
        <MobileHeader showAlarm={true} />
      </HeaderWrapper>

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
          {/*스크롤 감지를 위한 id 부여*/}
          <ContentWrapper id="app-scroll-view">{outlet}</ContentWrapper>
        </MotionPage>
      </AnimatePresence>

      <NavLayer>
        <MobileNav />
      </NavLayer>
    </Container>
  );
}

const Container = styled.div`
  width: 100%;
  height: 100%; /* 부모(AppContainer) 높이 상속 = 100vh */
  position: relative;
  overflow: hidden; /* 배경은 고정하고 내부 스크롤이 밖으로 넘치지 않게 함 */

  /* 배경 그라데이션 고정 */
  background: conic-gradient(
    from 85deg at 50.89% 49.77%,
    #cfe9ea 76.62456929683685deg,
    #d4e3ef 135.7189178466797deg,
    #def 265.1615309715271deg,
    #d4e3ef 314.8280382156372deg
  );
`;

const HeaderWrapper = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 50; /* MotionPage보다 위에 위치 */
`;

const MotionPage = styled(motion.div)`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%; /* 전체 높이를 차지해야 내부 스크롤 가능 */
  z-index: 10;
`;

const ContentWrapper = styled.div`
  width: 100%;
  height: 100%; /* MotionPage 꽉 채우기 */
  padding-top: 100px;
  padding-bottom: 100px;
  box-sizing: border-box;

  /* 여기서 스크롤 처리 */
  overflow-y: auto;
  overflow-x: hidden;

  /* 스크롤바 숨김 처리 (선택사항) */
  &::-webkit-scrollbar {
    display: none;
  }
  -ms-overflow-style: none;
  scrollbar-width: none;
`;

const NavLayer = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  z-index: 100;
`;
