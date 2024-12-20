// import AboutUsContainer from '../component/home/AboutUsContainer';
// import OurTeamContainer from '../component/home/OurTeamContainer';
// import ProductContainer from '../component/home/ProductContainer';
import styled from "styled-components";
import Calendar from "../container/home/CalendarContainer";
import Weather from "../component/home/Weather";
import Tip from "../container/home/TipContainer";
import Notice from "../container/home/NoticeContainer";
import AIEnter from "../container/home/AiEnter";
import Cafeteria from "../component/home/Cafeterias";
export default function HomePage() {
  return (
    <HomePageWrapper>
      {/*<Image/>*/}
      <MainWrapper>
        <Wrapper>
          <Weather />
          <Cafeteria />
        </Wrapper>
        <Tip />
        <Calendar />
      </MainWrapper>
      <AIEnter />
      <Notice />
    </HomePageWrapper>
  );
}

const HomePageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
  flex-wrap: wrap;
  z-index: 0;
  align-content: space-around;
  margin: 0 3rem;
  @media (max-width: 768px) {
    // 모바일
    display: flex;
    flex-direction: column;
    margin: 0px 10px 10px 10px;
  }
`;

const MainWrapper = styled.div`
  width: 100%;
  display: flex;
  /* justify-content: space-between; */
  gap: 32px;
  padding-top: 20px;
  @media (max-width: 768px) {
    // 모바일
    flex-direction: column;
  }
`;

const Wrapper = styled.div`
  width: 33%;
  display: flex;
  flex-direction: column;
  gap: 29px;
  padding-top: 30px;
  @media (max-width: 768px) {
    // 모바일 임시..
    display: none;
  }
`;
