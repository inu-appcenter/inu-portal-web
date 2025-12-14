import { Outlet } from "react-router-dom";
import styled from "styled-components";
import MobileNav from "@/containers/mobile/common/MobileNav";

export default function MainLayout() {
  return (
    <Container>
      {/*<MobileHeader />*/}
      <ContentWrapper>
        <Outlet />
      </ContentWrapper>
      <MobileNav />
    </Container>
  );
}

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  width: 100%;
  margin: 0 auto;
  overflow-y: hidden;
  box-sizing: border-box;
`;

const ContentWrapper = styled.div`
  flex: 1; // 핵심! 남은 공간을 모두 차지
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 100px;
  padding-bottom: 72px;
  overflow-y: hidden;

  background: conic-gradient(
    from 85deg at 50.89% 49.77%,
    #cfe9ea 76.62456929683685deg,
    #d4e3ef 135.7189178466797deg,
    #def 265.1615309715271deg,
    #d4e3ef 314.8280382156372deg
  );
`;
