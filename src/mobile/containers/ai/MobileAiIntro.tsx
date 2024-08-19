import styled from "styled-components";
import AiProfile from '../../../resource/assets/횃불-random1.svg';
import { useNavigate } from "react-router-dom";

export default function MobileAiIntro() {
  const navigate = useNavigate();
  return (
    <MobileAiIntroWrapper>
      <TitleWrapper>
        <Title1>Hello, </Title1>
        <Title2>AI 횃불이</Title2>
      </TitleWrapper>
      <IntroWrapper>
        <b style={{ fontSize: '20px' }}>AI 횃불이</b>는 창의적이고 재미있는 캐릭터를 AI로 생성하는 앱입니다.
        <br />
        <br />
        이 앱은 사용자가 입력한 특정 행동이나 상황을 바탕으로 고유한 캐릭터 이미지를 생성합니다.
        <br />
        예를 들어, <b>사용자가 "피자를 먹는 횃불이"와 같은 명령을 입력</b> 하면, 앱은 피자를 먹고 있는 횃불이의 이미지를 AI로 생성하여 제공합니다.
      </IntroWrapper>
      <ImageWrapper>
        <img src={AiProfile} />
        <StartContainer onClick={() => navigate('/m/ai/input')}>
          <StartText>시작하기</StartText>
          {/* <DragSquare /> */}
        </StartContainer>
      </ImageWrapper>
    </MobileAiIntroWrapper>
  );
}

const MobileAiIntroWrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin: 0 32px 0 32px;
  height: 100%;
`;

const TitleWrapper = styled.div`
  margin: 32px 0 32px 0;
  font-size: 48px;
  font-weight: 800;
`;

const Title1 = styled.span`
  color: white;
`;

const Title2 = styled.span`
  color: transparent;
  background: linear-gradient(270deg, #FFE5AE 24.95%, #FED2A7 30.62%, #FDC1A1 38.27%, #FB9291 47.42%, #D192C0 54.6%, #9892FF 63.63%);
  background-clip: text;
`;

const IntroWrapper = styled.span`
  font-size: 12px;
  font-weight: 500;
  color: white;
  margin: 0;
  line-height: 15px;
`;

const ImageWrapper = styled.div`
  flex: 1;
  margin-top: 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-around;
  img {
    width: 220px;
  }
`;

const StartContainer = styled.div`
  position: relative;
  max-width: 90vw;
  width: 400px;
  height: 84px;
  border: 1px solid white;
  border-radius: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const StartText = styled.span`
  font-size: 24px;
  font-weight: 800;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  color: white;
`;

/*
const DragSquare = styled.div`
  position: absolute;
  left: 8px;
  width: 66px;
  height: 66px;
  background-color: #9E8FE4;
  border-radius: 100%;
  z-index: 2;
`;
*/
