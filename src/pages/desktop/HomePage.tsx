import styled from "styled-components";
import Weather from "@/components/desktop/home/Weather";
import Cafeteria from "@/components/desktop/home/Cafeteria";
import Tips from "@/components/desktop/home/Tips";
import Calendar from "@/components/desktop/home/Calendar";
import AiEnter from "@/components/desktop/home/AiEnter";
import Notices from "@/components/desktop/home/Notices";

export default function HomePage() {
  return (
    <HomePageWrapper>
      <Wrapper1>
        <Wrapper2>
          <Weather />
          <Cafeteria />
        </Wrapper2>
        <Wrapper2>
          <Tips />
        </Wrapper2>
        <Wrapper2>
          <Calendar />
          <AiEnter />
        </Wrapper2>
      </Wrapper1>
      <Notices />
    </HomePageWrapper>
  );
}

const HomePageWrapper = styled.div`
  padding: 0 32px;
  display: flex;
  flex-direction: column;
`;

const Wrapper1 = styled.div`
  display: flex;
  justify-content: space-between;
  height: 580px;
`;

const Wrapper2 = styled.div`
  width: 440px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;
