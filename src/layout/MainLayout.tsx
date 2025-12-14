import { useLocation, useOutlet } from "react-router-dom";
import styled from "styled-components";
import { AnimatePresence, motion } from "framer-motion";
import MobileNav from "@/containers/mobile/common/MobileNav";

export default function MainLayout() {
  const location = useLocation();
  const outlet = useOutlet();

  return (
    <Container>
      {/* 겹침 허용을 위해 mode="sync" 또는 기본값 사용 */}
      <AnimatePresence mode="sync">
        <MotionPage
          key={location.pathname}
          // 1. 진입 시: 투명하고 흐린 상태에서 시작
          initial={{
            opacity: 0,
            x: 24,
            filter: "blur(8px)",
          }}
          // 2. 활성 시: 불투명하고 선명해짐
          animate={{
            opacity: 1,
            x: 0,
            filter: "blur(0px)",
          }}
          // 3. 퇴장 시: 다시 흐려지면서 투명해짐 (핵심)
          exit={{
            opacity: 0,
            x: -12,
            filter: "blur(8px)",
          }}
          transition={{
            duration: 0.25, // 블러 효과를 체감하도록 시간 소폭 연장 (취향껏 조절)
            ease: [0.4, 0.0, 0.2, 1],
          }}
        >
          <ContentWrapper>{outlet}</ContentWrapper>
        </MotionPage>
      </AnimatePresence>
      {/* Nav를 별도 레이어로 분리하여 고정 */}
      <NavLayer>
        <MobileNav />
      </NavLayer>
    </Container>
  );
}

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  width: 100%;
  //overflow: hidden;
  position: relative;
`;

const ContentWrapper = styled.div`
  flex: 1;
  position: relative;
  padding-top: 100px;
  padding-bottom: 72px;
  overflow-y: auto;
`;

const MotionPage = styled(motion.div)`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
`;

const NavLayer = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  z-index: 100;
`;
