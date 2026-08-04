import React, { ReactNode, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import styled, { keyframes } from "styled-components";
import CapsuleButton, { CapsuleButtonVariant } from "./CapsuleButton";
import { backHandler } from "@/utils/backHandler";

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
  const containerRef = useRef<HTMLDivElement>(null);

  // ESC 키 클릭 시 닫기, 스크롤 차단 및 뒤로가기 가로채기 효과
  useEffect(() => {
    if (!isOpen) return;

    // 모달 오픈 시 body 스크롤 방지
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    const handleBack = () => {
      onClose();
      return true; // 뒤로가기 가로채서 모달만 닫음
    };
    backHandler.pushHandler(handleBack);

    return () => {
      document.body.style.overflow = originalStyle;
      window.removeEventListener("keydown", handleKeyDown);
      backHandler.popHandler(handleBack);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (closeOnOverlayClick && containerRef.current && !containerRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  const handleStopPropagation = (e: React.SyntheticEvent) => {
    e.stopPropagation();
  };

  return createPortal(
    <ModalOverlay
      onClick={handleOverlayClick}
      onPointerDown={handleStopPropagation}
      onMouseDown={handleStopPropagation}
      onTouchStart={handleStopPropagation}
    >
      <ModalContainer
        ref={containerRef}
        onClick={handleStopPropagation}
        onPointerDown={handleStopPropagation}
        onMouseDown={handleStopPropagation}
        onTouchStart={handleStopPropagation}
      >
        <HeaderContainer>
          <ModalTitle>{title}</ModalTitle>
          {description && (
            <ModalDescription>
              {description}
            </ModalDescription>
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
    </ModalOverlay>,
    document.body
  );
}

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const scaleUp = keyframes`
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background-color: var(--bg-dim, rgba(0, 0, 0, 0.2));
  backdrop-filter: blur(2px);
  -webkit-backdrop-filter: blur(2px);
  z-index: 9999;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 16px;
  box-sizing: border-box;
  animation: ${fadeIn} 0.2s cubic-bezier(0.4, 0, 0.2, 1) forwards;
`;

const ModalContainer = styled.div`
  background-color: var(--bg-base, #ffffff);
  border-radius: 32px;
  width: 100%;
  max-width: 328px;
  padding: 20px 16px 16px 16px;
  box-sizing: border-box;
  box-shadow: 0px 4px 12px 0px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  gap: 24px;
  animation: ${scaleUp} 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  pointer-events: auto;
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
