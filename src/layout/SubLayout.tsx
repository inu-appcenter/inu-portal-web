import { Outlet } from "react-router-dom";
import styled from "styled-components";

export default function SubLayout() {
  return (
    <Container>
      {/*<MobileHeader hasback={true} title={"TIPS"} />*/}

      <ContentWrapper id="app-scroll-view">
        <Outlet />
      </ContentWrapper>
    </Container>
  );
}

const Container = styled.div`
  width: 100%;
  height: 100%; /* 부모(AppContainer) 높이 상속 = 100vh */
  position: relative;
  overflow: hidden; /* 배경은 고정하고 내부 스크롤이 밖으로 넘치지 않게 함 */
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

  ///* 스크롤바 숨김 처리 (선택사항) */
  //&::-webkit-scrollbar {
  //  display: none;
  //}
  //-ms-overflow-style: none;
  //scrollbar-width: none;
`;
