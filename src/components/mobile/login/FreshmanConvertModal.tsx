import { useState } from "react";
import styled from "styled-components";
import { convertFreshmanToStudent, getMembers } from "@/apis/members";
import {
  isMobileAppEnvironment,
  savePortalAccount,
} from "@/apis/mobileAgentBridge";
import { hasPortalSyncConsent } from "@/utils/portalSyncConsent";
import useUserStore from "@/stores/useUserStore";
import InputField from "@/components/common/InputField";

interface FreshmanConvertModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FreshmanConvertModal({
  isOpen,
  onClose,
}: FreshmanConvertModalProps) {
  const { setTokenInfo, setUserInfo } = useUserStore();

  const [studentId, setStudentId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  if (!isOpen) return null;

  const isFormValid = studentId.trim().length > 0 && password.trim().length > 0;

  const handleConvert = async () => {
    if (!isFormValid || loading) return;

    setErrorMessage("");
    const trimmedId = studentId.trim();
    const trimmedPassword = password.trim();

    try {
      setLoading(true);
      const res = await convertFreshmanToStudent(trimmedId, trimmedPassword);
      setTokenInfo(res.data);

      const memberRes = await getMembers();
      setUserInfo(memberRes.data);

      if (isMobileAppEnvironment() && hasPortalSyncConsent()) {
        try {
          await savePortalAccount(trimmedId, trimmedPassword);
        } catch (bridgeErr) {
          console.debug("[FreshmanConvertModal] savePortalAccount error:", bridgeErr);
        }
      }

      onClose();
      alert("정식 학번 계정으로 전환되었어요. 기존 데이터는 그대로 이어집니다.");
    } catch (err: any) {
      const status = err?.response?.status;
      const serverMsg =
        err?.response?.data?.msg || err?.response?.data?.message || "";

      if (status === 401) {
        setErrorMessage(
          serverMsg ||
            "학번 또는 비밀번호가 맞지 않아요. 포털 계정 정보를 다시 확인해주세요.",
        );
      } else if (status === 404 || status === 405) {
        setErrorMessage(
          "아직 학번 전환 기능이 준비 중이에요. 잠시 후 다시 시도해주세요.",
        );
      } else {
        setErrorMessage(
          serverMsg ||
            "정식 학번 전환 중 문제가 발생했어요. 잠시 후 다시 시도해주세요.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Overlay onClick={onClose}>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        <Header>
          <Title>정식 학번으로 전환하기</Title>
          <CloseButton type="button" onClick={onClose} aria-label="닫기">
            ✕
          </CloseButton>
        </Header>

        <Description>
          인천대학교 포털 학번과 비밀번호를 입력하면, 지금까지 만든 시간표와
          활동 내역을 그대로 유지한 채 정식 학생 계정으로 전환돼요.
        </Description>

        <FormSection>
          <InputField
            label="학번"
            type="text"
            inputMode="numeric"
            placeholder="예: 202700000"
            value={studentId}
            onChange={setStudentId}
            disabled={loading}
          />
          <InputField
            label="포털 비밀번호"
            type="password"
            placeholder="포털 비밀번호 입력"
            value={password}
            onChange={setPassword}
            disabled={loading}
          />
        </FormSection>

        {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}

        <ActionSection>
          <SubmitButton
            type="button"
            onClick={handleConvert}
            disabled={!isFormValid || loading}
          >
            {loading ? "전환 확인 중..." : "포털 계정으로 전환하기"}
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
