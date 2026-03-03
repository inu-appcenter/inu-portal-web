import styled from "styled-components";
import LoginLogo from "@/components/mobile/login/LoginLogo";
import LoginForm from "@/components/mobile/login/LoginForm";
import { useHeader } from "@/context/HeaderContext";

export default function MobileLoginPage() {
  useHeader({
    title: "로그인",
    hasback: true,
  });

  return (
    <MobileLoginPageWrapper>
      <Content>
        <LogoWrapper>
          <LoginLogo />
        </LogoWrapper>
        <LoginForm />
      </Content>
    </MobileLoginPageWrapper>
  );
}

const MobileLoginPageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding-bottom: 40px;
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 64px;
  width: 100%;
`;

const LogoWrapper = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;
  max-width: 240px;
  margin-top: 20px;
`;
