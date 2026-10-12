import React, { useState } from "react";
import styled from "styled-components";
import { Check, ShieldCheck, AlertCircle } from "lucide-react";
import InputField from "@/components/common/InputField";
import CapsuleButton from "@/components/common/CapsuleButton";
import {
  savePortalAccount,
  deletePortalAccount,
  fetchAcademicInfoFromApp,
  isMobileAppEnvironment,
} from "@/apis/mobileAgentBridge";
import { secureStorage } from "@/utils/secureStorage";
import { adaptAcademicInfoToStudentInfo } from "@/apis/portal";
import type { StudentInfo } from "@/types/portal";

export interface PortalAccountFormProps {
  mode?: "page" | "modal";
  onSuccess?: (studentInfo?: StudentInfo) => void;
  onCancel?: () => void;
  isRelink?: boolean;
}

export default function PortalAccountForm({
  mode = "page",
  onSuccess,
  onCancel,
  isRelink = false,
}: PortalAccountFormProps) {
  const [studentId, setStudentId] = useState("");
  const [password, setPassword] = useState("");
  const [agreedToSync, setAgreedToSync] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const isFormValid =
    studentId.trim().length > 0 &&
    password.trim().length > 0 &&
    agreedToSync;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId.trim() || !password.trim()) {
      setErrorMessage("학번과 비밀번호를 모두 입력해 주세요.");
      return;
    }

    if (!agreedToSync) {
      setErrorMessage("데이터 등록 동의에 체크해 주세요.");
      return;
    }

    if (!isMobileAppEnvironment()) {
      setErrorMessage("포털 계정 등록은 INTIP 앱에서만 지원돼요.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const saveRes = await savePortalAccount(studentId.trim(), password.trim());
      if (!saveRes.success) {
        setErrorMessage(saveRes.errorMessage || "계정 등록에 실패했어요.");
        setIsSubmitting(false);
        return;
      }

      // 학적 정보를 조회하여 유효성 확인 및 캐싱
      const academicRes = await fetchAcademicInfoFromApp().catch(() => null);
      let parsedStudent: StudentInfo | undefined;

      if (academicRes?.success && academicRes.data) {
        parsedStudent = adaptAcademicInfoToStudentInfo(academicRes.data);
        await secureStorage.setItem("portal_student_info", parsedStudent);
        localStorage.setItem("portal_info_last_updated", new Date().toISOString());
      } else if (academicRes && !academicRes.success) {
        const errText = academicRes.errorMessage || "";
        const isCredError =
          errText.includes("비밀번호") ||
          errText.includes("아이디") ||
          errText.includes("틀렸습니다") ||
          errText.includes("휴면");
        if (isCredError) {
          await deletePortalAccount().catch(() => {});
          setErrorMessage("학번 또는 비밀번호가 맞지 않아요. 다시 확인해 주세요.");
          setIsSubmitting(false);
          return;
        }
      }

      if (onSuccess) {
        onSuccess(parsedStudent);
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "등록 중 오류가 발생했어요.";
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FormContainer onSubmit={handleSubmit} $mode={mode}>
      <InputsSection>
        <InputField
          label="포털 학번"
          type="text"
          inputMode="numeric"
          placeholder="학번을 입력해 주세요"
          value={studentId}
          onChange={(val) => setStudentId(val)}
          disabled={isSubmitting}
        />

        <InputField
          label="포털 비밀번호"
          type="password"
          placeholder="포털 비밀번호를 입력해 주세요"
          value={password}
          onChange={(val) => setPassword(val)}
          disabled={isSubmitting}
        />
      </InputsSection>

      <ConsentCard
        type="button"
        $checked={agreedToSync}
        onClick={() => setAgreedToSync((prev) => !prev)}
      >
        <ConsentTop>
          <CheckboxSquare $checked={agreedToSync} aria-hidden="true">
            {agreedToSync && (
              <Check size={14} color="var(--text-inverse)" strokeWidth={3} />
            )}
          </CheckboxSquare>
          <ConsentLabel>
            기기에서 가져온 시간표와 학적 정보를 INTIP 서버에 등록하는 것에 동의해요
          </ConsentLabel>
        </ConsentTop>

        <ConsentDescription>
          <ShieldIconWrapper>
            <ShieldCheck size={14} color="var(--interactive-primary)" />
          </ShieldIconWrapper>
          <span>
            입력한 비밀번호는 외부로 전송되지 않고 이 기기 보안 영역에만 저장돼요.
            이 기기에서 직접 조회한 시간표와 학적 정보만 INTIP 서버에 등록돼요.
          </span>
        </ConsentDescription>
      </ConsentCard>

      {errorMessage && (
        <ErrorNotice>
          <AlertCircle size={15} color="var(--text-error)" />
          <span>{errorMessage}</span>
        </ErrorNotice>
      )}

      <ActionsSection>
        <CapsuleButton
          type="submit"
          variant="primary"
          fullWidth
          loading={isSubmitting}
          disabled={!isFormValid || isSubmitting}
        >
          {isSubmitting
            ? "계정 정보를 확인하고 있어요..."
            : isRelink
              ? "포털 계정 다시 등록하기"
              : "동의하고 계정 등록하기"}
        </CapsuleButton>

        {onCancel && (
          <CancelButton type="button" onClick={onCancel} disabled={isSubmitting}>
            취소하고 돌아가기
          </CancelButton>
        )}
      </ActionsSection>
    </FormContainer>
  );
}

const FormContainer = styled.form<{ $mode: "page" | "modal" }>`
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: ${({ $mode }) => ($mode === "modal" ? "14px" : "18px")};
`;

const InputsSection = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const ConsentCard = styled.button<{ $checked: boolean }>`
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px 14px;
  border-radius: var(--radius-md);
  border: 1px solid
    ${({ $checked }) =>
      $checked ? "var(--border-brand)" : "var(--border-default)"};
  background: ${({ $checked }) =>
    $checked ? "var(--bg-brand)" : "var(--bg-muted)"};
  text-align: left;
  cursor: pointer;
  transition: all 0.15s ease;

  &:active {
    transform: scale(0.99);
  }
`;

const ConsentTop = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  width: 100%;
`;

const CheckboxSquare = styled.div<{ $checked: boolean }>`
  width: 20px;
  height: 20px;
  border-radius: 6px;
  border: 1.5px solid
    ${({ $checked }) =>
      $checked ? "var(--interactive-primary)" : "var(--border-strong)"};
  background: ${({ $checked }) =>
    $checked ? "var(--interactive-primary)" : "var(--bg-base)"};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 1px;
  transition: all 0.15s ease;
`;

const ConsentLabel = styled.span`
  font-size: 13.5px;
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1.45;
  letter-spacing: -0.2px;
`;

const ConsentDescription = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 6px;
  padding-left: 30px;
  font-size: 12px;
  color: var(--text-secondary);
  line-height: 1.45;
  letter-spacing: -0.1px;
`;

const ShieldIconWrapper = styled.div`
  display: flex;
  align-items: center;
  flex-shrink: 0;
  margin-top: 1px;
`;

const ErrorNotice = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--text-error);
  background: var(--bg-error);
  padding: 10px 12px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-error-subtle);
  line-height: 1.4;
`;

const ActionsSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
  margin-top: 4px;
`;

const CancelButton = styled.button`
  background: none;
  border: none;
  color: var(--text-tertiary);
  font-size: 13.5px;
  font-weight: 500;
  cursor: pointer;
  padding: 8px 0;
  transition: color 0.15s ease;

  &:hover {
    color: var(--text-secondary);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;
