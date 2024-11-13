import styled from "styled-components";
import LoginBackground from "resources/assets/login/login-background.svg";
import LoginLogo from "resources/assets/login/login-logo.svg";
import LoginTips from "components/login/LoginTips";
import LoginInputs from "components/login/LoginInputs";

export default function LoginPage() {
  return (
    <LoginPageWrapper>
      <LoginBackgroundWrapper>
        <LoginBackgroundComponent />
        <LoginBackgroundImageComponent src={LoginBackground} />
        <LoginTips />
        <LoginLogoComponent src={LoginLogo} />
      </LoginBackgroundWrapper>
      <LoginInputs />
    </LoginPageWrapper>
  );
}

const LoginPageWrapper = styled.div`
  padding: 0 32px;
  height: 1024px;
  display: flex;
`;

const LoginBackgroundWrapper = styled.div`
  position: relative;
  height: 100%;
  width: 780px;
  border-radius: 40px 0px 0px 40px;
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
  left: 40px;
  top: 40px;
`;

const LoginLogoComponent = styled.img`
  z-index: 3;
  position: absolute;
  right: -115px;
  bottom: 0;
`;
