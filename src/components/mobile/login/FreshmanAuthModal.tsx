import { useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { isMobileAppEnvironment, requestFreshmanAuth } from "@/apis/mobileAgentBridge";
import { freshmanLogin } from "@/apis/members";
import useUserStore from "@/stores/useUserStore";
import { ROUTES } from "@/constants/routes";
import InputField from "@/components/common/InputField";
import { getAcademicYear } from "@/utils/academicYear";

interface FreshmanAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FreshmanAuthModal({
  isOpen,
  onClose,
}: FreshmanAuthModalProps) {
  const navigate = useNavigate();
  const { setTokenInfo } = useUserStore();

  const [examNo, setExamNo] = useState("");
  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  if (!isOpen) return null;

  const isFormValid =
    examNo.trim().length >= 4 &&
    name.trim().length >= 2 &&
    birthDate.trim().length === 8;

  const handleAuth = async () => {
    if (!isFormValid || loading) return;

    setErrorMessage("");

    // PC 웹 / 모바일 브라우저 환경 차단
    if (!isMobileAppEnvironment()) {
      setErrorMessage(
        "신입생 로그인은 인팁 모바일 앱에서만 지원해요. 인팁 앱을 설치한 뒤 다시 시도해주세요.",
      );
      return;
    }

    try {
      setLoading(true);

      // 1. 네이티브 웹뷰 스크레이퍼로 신입생 전산망 인증
      const scraperRes = await requestFreshmanAuth(
        examNo.trim(),
        name.trim(),
        birthDate.trim(),
      );

      if (!scraperRes.success || !scraperRes.data) {
        setErrorMessage(
          scraperRes.errorMessage ||
            "신입생 전산망 확인에 실패했어요. 입력 정보를 다시 확인해주세요.",
        );
        setLoading(false);
        return;
      }

      // 2. 백엔드 신입생 로그인 및 JWT 발급
      const loginRes = await freshmanLogin({
        examNo: examNo.trim(),
        name: name.trim(),
        birthDate: birthDate.trim(),
        deptNm: scraperRes.data.deptNm,
      });

      // 3. 토큰 보관 및 온보딩 페이지 이동
      setTokenInfo(loginRes.data);
      onClose();
      navigate(ROUTES.ONBOARDING, { replace: true });
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        "신입생 인증 중 문제가 발생했어요. 잠시 후 다시 시도해주세요.";
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Overlay onClick={onClose}>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        <Header>
          <Title>신입생 외부 로그인</Title>
          <CloseButton onClick={onClose} aria-label="닫기">
            ✕
          </CloseButton>
        </Header>

        <Description>
          {`아직 포털 계정이 발급되지 않은 ${getAcademicYear()}학년도 신입생은 수험번호와 생년월일로 미리 서비스를 이용할 수 있어요.`}
        </Description>

        <FormSection>
          <InputField
            label="수험번호"
            type="text"
            inputMode="numeric"
            placeholder="수험번호 입력"
            value={examNo}
            onChange={setExamNo}
            disabled={loading}
          />
          <InputField
            label="성명"
            type="text"
            placeholder="성명 입력"
            value={name}
            onChange={setName}
            disabled={loading}
          />
          <InputField
            label="생년월일 (8자리)"
            type="text"
            inputMode="numeric"
            placeholder="예: 20070101"
            value={birthDate}
            onChange={(val) => setBirthDate(val.replace(/\D/g, "").slice(0, 8))}
            disabled={loading}
          />
        </FormSection>

        {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}

        <ActionSection>
          <SubmitButton
            type="button"
            onClick={handleAuth}
            disabled={!isFormValid || loading}
          >
            {loading ? "인증 확인 중..." : "인증하고 시작하기"}
          </SubmitButton>
        </ActionSection>
      </ModalContainer>
    </Overlay>
  );
}

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease-out;

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

const ModalContainer = styled.div`
  width: 100%;
  max-width: 480px;
  background-color: var(--bg-surface, #ffffff);
  border-top-left-radius: 24px;
  border-top-right-radius: 24px;
  padding: 24px 20px calc(24px + env(safe-area-inset-bottom, 0px));
  box-sizing: border-box;
  animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);

  @keyframes slideUp {
    from {
      transform: translateY(100%);
    }
    to {
      transform: translateY(0);
    }
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
`;

const Title = styled.h2`
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary, #191f28);
  letter-spacing: -0.3px;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 20px;
  color: var(--text-caption, #8b95a1);
  cursor: pointer;
  padding: 4px;
`;

const Description = styled.p`
  margin: 0 0 20px;
  font-size: 14px;
  line-height: 1.5;
  color: var(--text-secondary, #4e5968);
`;

const FormSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ErrorMessage = styled.p`
  margin: 12px 0 0;
  font-size: 13px;
  line-height: 1.4;
  color: var(--status-error, #f04452);
`;

const ActionSection = styled.div`
  margin-top: 24px;
`;

const SubmitButton = styled.button`
  width: 100%;
  height: 52px;
  border: none;
  border-radius: 14px;
  background-color: var(--brand-primary, #3182f6);
  color: #ffffff;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.2s ease, transform 0.1s ease;

  &:active {
    transform: scale(0.98);
  }

  &:disabled {
    background-color: var(--bg-disabled, #e5e8eb);
    color: var(--text-disabled, #8b95a1);
    cursor: not-allowed;
    transform: none;
  }
`;
