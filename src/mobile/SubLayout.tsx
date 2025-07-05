import { Outlet } from "react-router-dom";
import styled from "styled-components";
import MobileHeader from "./containers/common/MobileHeader.tsx";

export default function SubLayout() {
  return (
    <Container>
      <MobileHeader />

      <ContentWrapper>
        <Outlet />
      </ContentWrapper>
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
  padding-top: 70px;

  padding-bottom: 72px;
  overflow-y: hidden;
`;
