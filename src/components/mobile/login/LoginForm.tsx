import { useState } from "react";
import axios from "axios";
import styled from "styled-components";
import { useLocation, useNavigate } from "react-router-dom";

import { login } from "@/apis/members";
import { ROUTES } from "@/constants/routes";
import InputField from "@/components/common/InputField";
import TermsLinks from "@/components/common/TermsLinks";
import useUserStore from "@/stores/useUserStore";
import { loginMascotFace } from "@/resources/assets/illustrations/login";

function getRedirectPath(search: string) {
  const redirect = new URLSearchParams(search).get("redirect");

  if (!redirect || !redirect.startsWith("/") || redirect.startsWith("//")) {
    return null;
  }

  return redirect;
}

export default function LoginForm() {
  const [loading, setLoading] = useState(false);
  const [studentId, setStudentId] = useState("");
  const [password, setPassword] = useState("");
  const { setTokenInfo } = useUserStore();
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = studentId.trim() !== "" && password.trim() !== "";

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      void handleLogin();
    }
  };

  const handleLogin = async () => {
    if (loading) {
      return;
    }
    if (studentId.trim() === "" || password.trim() === "") {
      return;
    }

    try {
      setLoading(true);
      const response = await login(studentId, password);
      setTokenInfo(response.data);
      setLoading(false);

      const redirectPath = getRedirectPath(location.search);

      navigate(redirectPath ?? ROUTES.HOME, { replace: true });
    } catch (error) {
      console.error("로그인 실패", error);
      setLoading(false);

      if (axios.isAxiosError(error) && error.response) {
        switch (error.response.status) {
          case 401:
            alert("학번 또는 비밀번호가 올바르지 않습니다.");
            break;
          default:
            alert("로그인에 실패했습니다.");
            break;
        }
      }
    }
  };

  return (
    <FormWrapper>
      <FieldsSection>
        <Guide>인천대학교 포털 시스템 계정으로 시작하세요.</Guide>
        <InputField
          label="학번"
          type="text"
          inputMode="numeric"
          autoComplete="username"
          placeholder="202600000"
          value={studentId}
          onChange={setStudentId}
          onKeyDown={handleKeyPress}
        />
        <InputField
          label="비밀번호"
          type="password"
          autoComplete="current-password"
          placeholder="********"
          value={password}
          onChange={setPassword}
          onKeyDown={handleKeyPress}
        />
      </FieldsSection>

      <ButtonSection>
        {/* 버튼 뒤에서 얼굴만 빼꼼 내미는 횃불이. 버튼이 아랫부분을 가리는 게
            의도라 절대배치 + 버튼을 위로 올리는 z-index로 겹쳐 둔다. */}
        <MascotFrame aria-hidden="true">
          <MascotImage src={loginMascotFace} alt="" />
        </MascotFrame>
        <LoginButton
          type="button"
          onClick={() => {
            void handleLogin();
          }}
          disabled={!isActive || loading}
          id="login-button"
        >
          {loading ? "로그인 중..." : "로그인"}
        </LoginButton>

        {/* 약관 동의는 로그인 후 최초 프로필 설정 화면에서 명시적으로 받는다. */}
        <TermsLinks />
      </ButtonSection>
    </FormWrapper>
  );
}

const FormWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 64px;
`;

const FieldsSection = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const Guide = styled.p`
  margin: 0;
  width: 100%;
  text-align: center;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.6;
  color: var(--text-secondary, #333d4b);
`;

const ButtonSection = styled.div`
  position: relative;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
`;

const MascotFrame = styled.div`
  position: relative;

  z-index: 0;
  pointer-events: none;
`;

const MascotImage = styled.img`
  position: absolute;
  
  width: 88.5678px;
  height: 44.1181px;
  right: -44.1181px;
  bottom: -23px;
`;

const LoginButton = styled.button`
  position: relative;
  z-index: 1;
  width: 100%;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px 24px;
  box-sizing: border-box;
  border: none;
  border-radius: var(--radius-full, 999px);
  background: var(--blue-800, #003a99);
  color: var(--text-inverse, #ffffff);
  font-size: 16px;
  font-weight: 700;
  line-height: 24px;
  letter-spacing: -0.2px;
  cursor: pointer;
  transition: background 0.2s ease;

  &:disabled {
    background: var(--bg-disabled, #e5e8eb);
    color: var(--text-disabled, #b0b8c1);
    cursor: not-allowed;
  }
`;
