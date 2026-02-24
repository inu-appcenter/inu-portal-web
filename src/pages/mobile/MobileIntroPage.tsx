import styled, { keyframes } from "styled-components";
import logoWithText from "@/resources/assets/mobile-login/logo-with-text.svg";

export default function MobileIntroPage() {
  return (
    <IntroPageWrapper>
      <IntroImage src={logoWithText} alt="" />
      <div />
    </IntroPageWrapper>
  );
}

const fadeOut = keyframes`
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
`;

const IntroPageWrapper = styled.div`
  background-color: rgba(255, 255, 255);
  height: 100%;
  width: 100%;
  display: flex;
  position: absolute;
  flex-direction: column;
  align-items: center;
  justify-content: space-around;
  z-index: 100;

  animation: ${fadeOut} 1s ease forwards;
  animation-delay: 0.5s;
`;

const IntroImage = styled.img`
  width: 75%;
`;
