// AiIntroText.tsx
import styled from "styled-components";

export default function AiIntroText() {
  return (
    <IntroTextWrapper>
      <span style={{ fontSize: "16px", lineHeight: "20px" }}>
        <b style={{ fontSize: "20px" }}>AI 횃불이</b>는 창의적이고 재미있는
        캐릭터를 AI로 생성하는 앱입니다.
        <br />
        <br />
        이 앱은 사용자가 입력한 특정 행동이나 상황을 바탕으로 고유한 캐릭터
        이미지를 생성합니다.
        <br />
        예를 들어, <b>"피자를 먹는 횃불이"</b>와 같은 명령을 입력하면, 앱은
        피자를 먹고 있는 횃불이의 이미지를 AI로 생성하여 제공합니다.
      </span>
    </IntroTextWrapper>
  );
}

const IntroTextWrapper = styled.div`
  color: white;
`;
