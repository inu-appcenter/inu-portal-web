import styled from "styled-components";
import LoginBackground from "../../resource/assets/LoginBackground.svg";
import LoginTipImage from "../../component/login/LoginTipImage";

import LoginBackgroundElement2 from "../../resource/assets/LoginBackgroundElement2.svg";

export default function LoginImg() {
  return (
    <LoginImageWrapper>
      <LoginBackgroundComponent />
      <LoginBackgroundImageComponent src={LoginBackground} />
      <LoginTipImage />
      <LoginBackgroundElement2Wrapper src={LoginBackgroundElement2} />
    </LoginImageWrapper>
  );
}

const LoginImageWrapper = styled.div`
  position: relative;
  height: 100%;
  width: 769px;
  @media (max-width: 768px) {
    // 모바일
    display: none;
  }
`;

const LoginBackgroundComponent = styled.div`
  position: absolute;
  border-radius: 40px 0px 0px 40px;
  background: linear-gradient(90deg, #c6d8f3 0%, #91a7e3 100%);
  height: 100%;
  width: 110%;
  z-index: 1;
`;
const LoginBackgroundImageComponent = styled.img`
  position: absolute;
  z-index: 2;
  left: 50px;
  top: 30px;
`;

const LoginBackgroundElement2Wrapper = styled.img`
  z-index: 3;
  position: absolute;
  right: -115px;
  bottom: 0;
`;
