import { useState, useEffect } from "react";
import styled from "styled-components";
import Modal from "@/components/common/Modal";

interface EditFriendAliasModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  currentAlias: string;
  onConfirm: (newAlias: string) => void | Promise<void>;
}

export default function EditFriendAliasModal({
  isOpen,
  onOpenChange,
  currentAlias,
  onConfirm,
}: EditFriendAliasModalProps) {
  const [alias, setAlias] = useState(currentAlias);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setAlias(currentAlias);
    }
  }, [isOpen, currentAlias]);

  const handleUpdate = async () => {
    setIsLoading(true);
    try {
      await onConfirm(alias.trim());
      onOpenChange(false);
    } catch (error) {
      console.error("친구 별명 변경 실패:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => onOpenChange(false)}
      title="별명 수정"
      description="설정한 별명은 나에게만 보여요."
      primaryButton={{
        text: isLoading ? "수정 중..." : "수정하기",
        onClick: handleUpdate,
        variant: "primary",
        disabled: isLoading,
      }}
      secondaryButton={{
        text: "취소",
        onClick: () => onOpenChange(false),
        variant: "secondary",
      }}
    >
      <Input
        placeholder="새로운 별명을 입력하세요"
        value={alias}
        onChange={(e) => setAlias(e.target.value)}
        maxLength={20}
        autoFocus
      />
    </Modal>
  );
}

const Input = styled.input`
  width: 100%;
  padding: 12px 16px;
  border-radius: 12px;
  border: 1px solid var(--border-default, #e5e8eb);
  font-family: Pretendard;
  font-size: 16px;
  box-sizing: border-box;
  outline: none;

  &:focus {
    border-color: var(--border-brand, #5E92F0);
  }
`;
