import styled from "styled-components";
import BackButton from "@/components/mobile/login/BackButton";
import LoginLogo from "@/components/mobile/login/LoginLogo";
import LoginForm from "@/components/mobile/login/LoginForm";

export default function MobileLoginPage() {
  return (
    <MobileLoginPageWrapper>
      <BackButtonWrapper>
        <BackButton />
      </BackButtonWrapper>
      <Content>
        <LoginLogo />
        <LoginForm />
      </Content>
    </MobileLoginPageWrapper>
  );
}

const MobileLoginPageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
`;

const BackButtonWrapper = styled.div`
  padding: 32px;
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 128px;
`;
