import React, { ReactNode } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import styled, { keyframes } from "styled-components";
import CapsuleButton, { CapsuleButtonVariant } from "./CapsuleButton";
import { useSheetBackHandler } from "@/hooks/useSheetBackHandler";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: ReactNode | string;
  children?: ReactNode;
  primaryButton?: {
    text: string;
    onClick: () => void;
    variant?: CapsuleButtonVariant; // "brand" | "danger" | "primary" | "secondary"
    disabled?: boolean;
    loading?: boolean;
    // variant 팔레트로 표현 안 되는 화면별 강조색이 필요할 때만 사용 (예: 진한 빨강 파괴적 확정 버튼)
    style?: React.CSSProperties;
  };
  secondaryButton?: {
    text: string;
    onClick: () => void;
    variant?: CapsuleButtonVariant;
    disabled?: boolean;
    style?: React.CSSProperties;
  };
  closeOnOverlayClick?: boolean;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  primaryButton,
  secondaryButton,
  closeOnOverlayClick = true,
}: ModalProps) {
  useSheetBackHandler(isOpen, onClose);

  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <Dialog.Portal>
        <ModalOverlay />
        <ModalContainer
          onPointerDownOutside={(e) => {
            if (!closeOnOverlayClick) {
              e.preventDefault();
            }
          }}
        >
          <HeaderContainer>
            <Dialog.Title asChild>
              <ModalTitle>{title}</ModalTitle>
            </Dialog.Title>
            {description && (
              <Dialog.Description asChild>
                <ModalDescription>{description}</ModalDescription>
              </Dialog.Description>
            )}
          </HeaderContainer>

          {children && <ModalSlot>{children}</ModalSlot>}

          {(primaryButton || secondaryButton) && (
            <ButtonContainer>
              {secondaryButton && (
                <ModalButton
                  variant={secondaryButton.variant || "secondary"}
                  onClick={secondaryButton.onClick}
                  disabled={secondaryButton.disabled}
                  fullWidth={!primaryButton}
                  style={secondaryButton.style}
                >
                  {secondaryButton.text}
                </ModalButton>
              )}
              {primaryButton && (
                <ModalButton
                  variant={primaryButton.variant || "brand"}
                  onClick={primaryButton.onClick}
                  disabled={primaryButton.disabled}
                  loading={primaryButton.loading}
                  fullWidth={!secondaryButton}
                  style={primaryButton.style}
                >
                  {primaryButton.text}
                </ModalButton>
              )}
            </ButtonContainer>
          )}
        </ModalContainer>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const scaleUp = keyframes`
  from {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
`;

const ModalOverlay = styled(Dialog.Overlay)`
  position: fixed;
  inset: 0;
  background-color: var(--bg-dim, rgba(0, 0, 0, 0.2));
  backdrop-filter: blur(2px);
  -webkit-backdrop-filter: blur(2px);
  z-index: 9999;
  animation: ${fadeIn} 0.2s cubic-bezier(0.4, 0, 0.2, 1) forwards;
`;

const ModalContainer = styled(Dialog.Content)`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: var(--bg-base, #ffffff);
  border-radius: 32px;
  width: calc(100% - 32px);
  max-width: 328px;
  padding: 20px 16px 16px 16px;
  box-sizing: border-box;
  box-shadow: 0px 4px 12px 0px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  gap: 24px;
  z-index: 10000;
  outline: none;
  animation: ${scaleUp} 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
`;

const HeaderContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  align-items: center;
`;

const ModalTitle = styled.h2`
  margin: 0;
  font-size: 20px;
  font-style: normal;
  font-weight: 600;
  line-height: 32px;
  letter-spacing: 0;
  color: var(--gray-800, #333d4b);
  text-align: center;
  word-break: keep-all;
  overflow-wrap: break-word;
  width: 100%;
`;

const ModalDescription = styled.div`
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: 1.6;
  color: var(--gray-600, #6b7684);
  text-align: center;
  word-break: keep-all;
  overflow-wrap: break-word;
  white-space: pre-wrap;
  width: 100%;
`;

const ModalSlot = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  gap: 12px;

  /* 모달 내부 InputField/SelectContainer 등의 배경색을 피그마 사양인 흰색(var(--bg-base))으로 덮어씀 */
  & > div {
    background-color: var(--bg-base, #ffffff) !important;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 12px;
  width: 100%;
  box-sizing: border-box;
  align-items: center;
`;

const ModalButton = styled(CapsuleButton)`
  flex: 1;
  font-size: 16px !important;
  font-weight: 700 !important;
  line-height: 24px !important;
  letter-spacing: -0.2px !important;
  padding: 12px 24px !important;
`;
