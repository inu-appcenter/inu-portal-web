import { useEffect, useRef, useState } from "react";
import axios from "axios";
import styled from "styled-components";
import { useLocation, useNavigate } from "react-router-dom";

import { login } from "@/apis/members";
import {
  savePortalAccount,
  fetchAcademicInfoFromApp,
  isMobileAppEnvironment,
} from "@/apis/mobileAgentBridge";
import { adaptAcademicInfoToStudentInfo } from "@/apis/portal";
import { secureStorage } from "@/utils/secureStorage";
import { ROUTES } from "@/constants/routes";
import InputField from "@/components/common/InputField";
import TermsLinks from "@/components/common/TermsLinks";
import useUserStore from "@/stores/useUserStore";
import { identifyUser, mixpanelTrack } from "@/utils/mixpanel";
import { getMemberIdFromToken } from "@/utils/token";
import { safeLocalStorage } from "@/utils/safeStorage";
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
  // 리디자인된 로그인 화면에서 "진입 → 로그인 완료"까지 걸린 시간 측정용
  const mountedAtRef = useRef(0);
  useEffect(() => {
    mountedAtRef.current = Date.now();
  }, []);

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

    const attemptStartedAt = Date.now();
    try {
      setLoading(true);
      const trimmedId = studentId.trim();
      const trimmedPassword = password.trim();

      mixpanelTrack.loginAttempted();
      const response = await login(trimmedId, trimmedPassword);
      setTokenInfo(response.data);

      // 사용자 식별을 가입 이벤트보다 먼저 한다. identify가 가입 전 익명 이벤트와
      // 가입 후 사용자를 하나로 잇고, sign_up도 이 사용자의 이벤트로 남는다.
      const memberId = getMemberIdFromToken(response.data.accessToken);
      if (memberId) {
        identifyUser(memberId);
      }
      // 구버전 서버는 isNewMember를 내려 주지 않는다(undefined → 가입 이벤트 생략).
      const isNewMember =
        typeof response.data.isNewMember === "boolean"
          ? response.data.isNewMember
          : null;
      mixpanelTrack.loginSucceeded({
        isNewMember,
        durationMs: Date.now() - attemptStartedAt,
        timeOnScreenMs: Date.now() - mountedAtRef.current,
      });
      if (isNewMember === true) {
        mixpanelTrack.signUp();
        // 온보딩 퍼널의 마지막 단계(첫 홈 진입)를 이 계정에서만 재도록 표시를 남긴다.
        if (memberId) {
          safeLocalStorage.setItem(`intipOnboardingPending:${memberId}`, "1");
        }
      }

      // 모바일 앱 환경인 경우 기기 보안 KeyStore에 포털 계정 1회 자동 등록 및 학적 사전 캐싱
      if (isMobileAppEnvironment()) {
        try {
          await savePortalAccount(trimmedId, trimmedPassword);
          void fetchAcademicInfoFromApp().then((res) => {
            if (res.success && res.data) {
              const student = adaptAcademicInfoToStudentInfo(res.data);
              void secureStorage.setItem("portal_student_info", student);
              localStorage.setItem("portal_info_last_updated", new Date().toISOString());
            }
          }).catch(() => {});
        } catch (bridgeErr) {
          console.debug("[LoginForm] auto portal account link error:", bridgeErr);
        }
      }

      setLoading(false);

      const redirectPath = getRedirectPath(location.search);

      navigate(redirectPath ?? ROUTES.HOME, { replace: true });
    } catch (error) {
      console.error("로그인 실패", error);
      setLoading(false);

      mixpanelTrack.loginFailed({
        reason: !axios.isAxiosError(error)
          ? "unknown"
          : !error.response
            ? "network_error"
            : error.response.status === 401
              ? "invalid_credentials"
              : "server_error",
        status: axios.isAxiosError(error) ? error.response?.status : undefined,
        durationMs: Date.now() - attemptStartedAt,
      });

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
  color: var(--text-secondary);
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
  border-radius: var(--radius-full);
  background: var(--blue-800);
  color: var(--text-inverse);
  font-size: 16px;
  font-weight: 700;
  line-height: 24px;
  letter-spacing: -0.2px;
  cursor: pointer;
  transition: background 0.2s ease;

  &:disabled {
    background: var(--bg-disabled);
    color: var(--text-disabled);
    cursor: not-allowed;
  }
`;
