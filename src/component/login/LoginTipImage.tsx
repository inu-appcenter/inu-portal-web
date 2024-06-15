import { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import LoginTipImg1 from '../../resource/assets/LoginTipImg1.svg';
import LoginTipImg2 from '../../resource/assets/LoginTipImg2.svg';
import LoginTipImg3 from '../../resource/assets/LoginTipImg3.svg';
import LoginTipImg4 from '../../resource/assets/LoginTipImg4.svg';

const images = [LoginTipImg1, LoginTipImg2, LoginTipImg3, LoginTipImg4];

export default function LoginTipImage() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <LoginTipImageComponent src={images[currentImageIndex]} key={currentImageIndex} />
      <Indicators>
        {images.map((_, index) => (
          <Indicator key={index} isActive={index === currentImageIndex} />
        ))}
      </Indicators>
    </>
  );
}

const fadein = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const fadeout = keyframes`
  from { opacity: 1; }
  to { opacity: 0; }
`;

const LoginTipImageComponent = styled.img`
  z-index: 4;
  position: absolute;
  left: 50%;
  top: 180px;
  transform: translateX(-50%);
  width: 90%;
  max-height: calc(100% - 200px);
  object-fit: contain;
  animation: ${fadein} 1s, ${fadeout} 1s 4s;
`;

const Indicators = styled.div`
  z-index: 5;
  position: absolute;
  bottom: 50px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  justify-content: center;
  gap: 10px;
  border-radius: 8px;
  background-color: rgba(0,0,0,0.25);
  padding: 5px;
`;

const Indicator = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'isActive',
})<{ isActive: boolean }>`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: ${({ isActive }) => (isActive ? 'black' : 'white')};
`;
