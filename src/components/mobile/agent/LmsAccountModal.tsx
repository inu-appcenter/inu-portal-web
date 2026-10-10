import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { X, Lock, User, GraduationCap } from "lucide-react";
import { saveLmsAccount, isMobileAppEnvironment } from "@/apis/mobileAgentBridge";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const LmsAccountModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (isOpen) {
      setUsername("");
      setPassword("");
      setErrorMessage("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setErrorMessage("학번과 비밀번호를 모두 입력해 주세요.");
      return;
    }

    if (!isMobileAppEnvironment()) {
      setErrorMessage("LMS 계정 연동은 INTIP 모바일 앱 환경에서만 지원됩니다.");
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      const res = await saveLmsAccount(username.trim(), password.trim());
      if (res.success) {
        if (onSuccess) onSuccess();
        onClose();
      } else {
        setErrorMessage(res.errorMessage || "이러닝(LMS) 로그인에 실패했습니다.");
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Overlay onClick={onClose}>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        <Header>
          <TitleRow>
            <GraduationCap size={20} color="var(--text-success)" />
            <Title>이러닝(LMS) 계정 연동</Title>
          </TitleRow>
          <CloseButton onClick={onClose} type="button">
            <X size={20} />
          </CloseButton>
        </Header>

        <Form onSubmit={handleSubmit}>
          <NoticeBox>
            💡 인천대 포털, 이러닝(LMS), 도서관은 동일한 학번/비밀번호를 사용합니다. 1회만 연동하시면 포털 학적, LMS 과제, 도서관 좌석까지 모든 캠퍼스 서비스가 안전하게 한 번에 자동 연동됩니다. (기기 보안 영역 SecureStore 보관)
          </NoticeBox>

          <InputGroup>
            <Label>LMS 사용자 아이디 (학번)</Label>
            <InputWrap>
              <User size={16} color="var(--text-tertiary)" />
              <Input
                type="text"
                placeholder="예: 202001518"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
                autoFocus
              />
            </InputWrap>
          </InputGroup>

          <InputGroup>
            <Label>LMS 비밀번호</Label>
            <InputWrap>
              <Lock size={16} color="var(--text-tertiary)" />
              <Input
                type="password"
                placeholder="이러닝 비밀번호 (포털 비밀번호)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </InputWrap>
          </InputGroup>

          {errorMessage && <ErrorText>{errorMessage}</ErrorText>}

          <SubmitButton type="submit" disabled={loading}>
            {loading ? "계정 확인 중..." : "안전하게 연동하기"}
          </SubmitButton>
        </Form>
      </ModalContainer>
    </Overlay>
  );
};

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 20px;
`;

const ModalContainer = styled.div`
  background: var(--bg-base);
  border-radius: 20px;
  width: 100%;
  max-width: 360px;
  padding: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
`;

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Title = styled.h2`
  font-size: 16.5px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: var(--text-tertiary);
  cursor: pointer;
  padding: 4px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const NoticeBox = styled.div`
  background: rgb(238, 250, 243);
  border: 1px solid rgb(201, 238, 215);
  border-radius: 12px;
  padding: 12px;
  font-size: 12px;
  color: var(--text-success);
  line-height: 1.5;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const Label = styled.label`
  font-size: 13px;
  font-weight: 600;
  color: var(--gray-700);
`;

const InputWrap = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  border: 1px solid var(--border-default);
  border-radius: 10px;
  padding: 10px 12px;
  background: var(--bg-subtle);
`;

const Input = styled.input`
  border: none;
  background: transparent;
  width: 100%;
  font-size: 14px;
  color: var(--text-primary);
  outline: none;
`;

const ErrorText = styled.span`
  font-size: 12px;
  color: var(--text-error);
  font-weight: 500;
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 12px 0;
  background: var(--text-success);
  color: var(--text-inverse);
  border: none;
  border-radius: 12px;
  font-size: 14.5px;
  font-weight: 700;
  cursor: pointer;
  margin-top: 6px;
  transition: background 0.2s;

  &:disabled {
    background: rgb(153, 219, 185);
    cursor: not-allowed;
  }
`;
