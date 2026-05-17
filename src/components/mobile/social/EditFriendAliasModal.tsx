import * as Dialog from "@radix-ui/react-dialog";
import styled, { keyframes } from "styled-components";
import Box from "@/components/common/Box";
import BottomButtonGroup from "@/components/common/BottomButtonGroup";
import { useState, useEffect } from "react";

const contentShow = keyframes`
  from { opacity: 0; transform: translate(-50%, -48%) scale(0.96); }
  to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
`;

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

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
    <Dialog.Root open={isOpen} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <StyledOverlay />
        <StyledContent>
          <Box
            style={{
              width: "100%",
              padding: "0",
              display: "flex",
              flexDirection: "column",
              gap: "0",
              alignItems: "stretch",
              overflow: "hidden",
            }}
          >
            <Header>
              <Title>별명 수정</Title>
              <Description>설정한 별명은 나에게만 보여요.</Description>
            </Header>

            <FormArea>
              <FormGroup>
                <Input
                  placeholder="새로운 별명을 입력하세요"
                  value={alias}
                  onChange={(e) => setAlias(e.target.value)}
                  maxLength={20}
                  autoFocus
                />
              </FormGroup>
            </FormArea>

            <BottomButtonGroup
              leftButton={{
                label: "취소",
                onClick: () => onOpenChange(false),
                backgroundColor: "#F2F2F7",
                textColor: "#1C1C1E",
              }}
              rightButton={{
                label: isLoading ? "수정 중..." : "수정하기",
                onClick: handleUpdate,
                backgroundColor: "#5E92F0",
                textColor: "#FFFFFF",
                disabled: isLoading,
              }}
              padding="16px 24px 24px"
              height="88px"
              position="static"
            />
          </Box>
        </StyledContent>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

const StyledOverlay = styled(Dialog.Overlay)`
  position: fixed;
  inset: 0;
  z-index: 4000;
  background-color: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(2px);
  animation: ${fadeIn} 200ms ease-out;
`;

const StyledContent = styled(Dialog.Content)`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 90vw;
  max-width: 400px;
  z-index: 4001;
  display: flex;
  flex-direction: column;
  outline: none;
  animation: ${contentShow} 200ms cubic-bezier(0.16, 1, 0.3, 1);
`;

const Header = styled.div`
  padding: 24px 24px 16px;
`;

const Title = styled.h2`
  font-size: 20px;
  font-weight: 700;
  color: #1c1c1e;
  margin: 0;
`;

const FormArea = styled.div`
  padding: 0 24px 16px;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 16px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  font-size: 16px;
  box-sizing: border-box;
  outline: none;

  &:focus {
    border-color: #5E92F0;
  }
`;

const Description = styled.p`
  font-size: 13px;
  color: #8e8e93;
  margin: 4px 0 0 0;
  line-height: 1.4;
`;
