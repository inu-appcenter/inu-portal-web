import styled, { keyframes } from 'styled-components';
import intro from '../resource/assets/intro.svg';

export default function IntroPage() {
  return (
    <IntroPageWrapper>
      <IntroImage src={intro} />
    </IntroPageWrapper>
  )
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
  background-color: rgba(255, 255, 255, 0.8);
  height: 100%;
  width: 100%;
  display: flex;
  position: absolute;
  flex-direction: column;
  align-items: center;
  z-index: 100;

  animation: ${fadeOut} 3s ease forwards;
  animation-delay: 1s;
`;

const IntroImage = styled.img`
  border-radius: 20px;
  width: 90%;
  margin-top: 20px;
`;