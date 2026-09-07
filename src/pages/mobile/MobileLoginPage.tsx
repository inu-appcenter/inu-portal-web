import styled from "styled-components";
import LoginLogo from "@/components/mobile/login/LoginLogo";
import LoginForm from "@/components/mobile/login/LoginForm";
import { useHeader } from "@/context/HeaderContext";

export default function MobileLoginPage() {
  useHeader({
    title: "로그인",
    hasback: true,
    pageBgColor: "#ffffff",
  });

  return (
    <MobileLoginPageWrapper>
      <LogoSection>
        <LoginLogo />
      </LogoSection>
      <LoginForm />
    </MobileLoginPageWrapper>
  );
}

const MobileLoginPageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  padding: 0 32px 40px;
  box-sizing: border-box;
  height:100vh;
`;

/** 로고 위아래 여백까지 포함한 고정 높이 영역(디자인 240px). */
const LogoSection = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 240px;
  flex-shrink: 0;
`;
