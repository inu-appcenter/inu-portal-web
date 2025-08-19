import { Outlet } from "react-router-dom";
import styled from "styled-components";

export default function SubLayout() {
  return (
    <Container>
      {/*<MobileHeader />*/}

      <OutletWrapper>
        <Outlet />
      </OutletWrapper>
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

const OutletWrapper = styled.div`
  flex: 1;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
`;
