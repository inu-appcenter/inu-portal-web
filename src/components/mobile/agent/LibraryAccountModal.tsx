import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { X, ShieldCheck, Lock, User } from "lucide-react";
import { saveLibraryAccount, isMobileAppEnvironment } from "@/apis/mobileAgentBridge";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const LibraryAccountModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (isOpen) {
      setLoginId("");
      setPassword("");
      setErrorMessage("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginId.trim() || !password.trim()) {
      setErrorMessage("아이디(학번)와 비밀번호를 모두 입력해 주세요.");
      return;
    }

    if (!isMobileAppEnvironment()) {
      setErrorMessage("도서관 계정 연동은 INTIP 모바일 앱 환경에서만 지원됩니다.");
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      const res = await saveLibraryAccount(loginId.trim(), password.trim());
      if (res.success) {
        if (onSuccess) onSuccess();
        onClose();
      } else {
        setErrorMessage(res.errorMessage || "도서관 계정 연동에 실패했습니다.");
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
            <ShieldCheck size={20} color="#3182f6" />
            <Title>학산도서관 계정 연동</Title>
          </TitleRow>
          <CloseButton onClick={onClose} type="button">
            <X size={20} />
          </CloseButton>
        </Header>

        <Form onSubmit={handleSubmit}>
          <NoticeBox>
            열람실 좌석 배정 및 스터디룸 예약을 위해 도서관(lib.inu.ac.kr) 계정을 연동합니다.
            입력하신 정보는 기기 보안 영역(SecureStore)에만 안전하게 보관됩니다.
          </NoticeBox>

          <InputGroup>
            <Label>도서관 아이디 (학번)</Label>
            <InputWrap>
              <User size={16} color="#8b95a1" />
              <Input
                type="text"
                placeholder="예: 202001518"
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
                disabled={loading}
                autoFocus
              />
            </InputWrap>
          </InputGroup>

          <InputGroup>
            <Label>도서관 비밀번호</Label>
            <InputWrap>
              <Lock size={16} color="#8b95a1" />
              <Input
                type="password"
                placeholder="도서관 시스템 비밀번호"
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
  background: #ffffff;
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
  color: #191f28;
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #8b95a1;
  cursor: pointer;
  padding: 4px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const NoticeBox = styled.div`
  background: #f0f7ff;
  border: 1px solid #d0e7ff;
  border-radius: 12px;
  padding: 12px;
  font-size: 12px;
  color: #1b64da;
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
  color: #4e5968;
`;

const InputWrap = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  border: 1px solid #e5e8eb;
  border-radius: 10px;
  padding: 10px 12px;
  background: #f9fafb;
`;

const Input = styled.input`
  border: none;
  background: transparent;
  width: 100%;
  font-size: 14px;
  color: #191f28;
  outline: none;
`;

const ErrorText = styled.span`
  font-size: 12px;
  color: #f04452;
  font-weight: 500;
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 12px 0;
  background: #3182f6;
  color: #ffffff;
  border: none;
  border-radius: 12px;
  font-size: 14.5px;
  font-weight: 700;
  cursor: pointer;
  margin-top: 6px;
  transition: background 0.2s;

  &:disabled {
    background: #b0cbf7;
    cursor: not-allowed;
  }
`;
