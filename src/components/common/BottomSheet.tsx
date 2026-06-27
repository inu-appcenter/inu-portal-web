import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { Drawer } from "vaul";
import { X } from "lucide-react";

export interface BottomSheetProps {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
  snapPoints?: (string | number)[];
  activeSnapPoint?: string | number | null;
  setActiveSnapPoint?: (snap: any) => void;
  modal?: boolean;
  dismissible?: boolean;
  disablePreventScroll?: boolean;
  snapToSequentialPoint?: boolean;
  showCloseButton?: boolean;
  repositionInputs?: boolean;
  zIndex?: number;
}

export default function BottomSheet({
  open,
  onOpenChange,
  children,
  snapPoints,
  activeSnapPoint: externalActiveSnapPoint,
  setActiveSnapPoint: externalSetActiveSnapPoint,
  modal = true,
  dismissible = true,
  disablePreventScroll = true,
  snapToSequentialPoint = true,
  showCloseButton = false,
  repositionInputs = false,
  zIndex,
}: BottomSheetProps) {
  // snapPoints가 존재하지만 외부에서 활성 스냅 포인트 상태가 주어지지 않은 경우 내부에서 상태 관리
  const [internalActiveSnapPoint, setInternalActiveSnapPoint] = useState<string | number | null>(
    snapPoints && snapPoints.length > 0 ? snapPoints[snapPoints.length - 1] : null
  );

  const activeSnapPoint = externalActiveSnapPoint !== undefined ? externalActiveSnapPoint : internalActiveSnapPoint;
  const setActiveSnapPoint = externalSetActiveSnapPoint || setInternalActiveSnapPoint;

  useEffect(() => {
    if (open && snapPoints && snapPoints.length > 0 && externalActiveSnapPoint === undefined) {
      setInternalActiveSnapPoint(snapPoints[snapPoints.length - 1]);
    }
  }, [open, snapPoints, externalActiveSnapPoint]);

  // modal={false}일 때 외부 포탈 요소(예: 검색바 인풋)로의 포커스 이동을 차단하는 Radix FocusScope의 포커스 트랩 버그 완벽 차단
  useEffect(() => {
    if (!open || modal) return;

    const handleFocusIn = (e: FocusEvent) => {
      e.stopImmediatePropagation();
    };

    document.addEventListener("focusin", handleFocusIn, true);
    return () => {
      document.removeEventListener("focusin", handleFocusIn, true);
    };
  }, [open, modal]);

  const singleSnapHeight = snapPoints && snapPoints.length === 1 ? snapPoints[0] : undefined;

  return (
    <Drawer.Root
      open={open}
      onOpenChange={onOpenChange}
      modal={modal}
      dismissible={dismissible}
      snapPoints={snapPoints}
      activeSnapPoint={activeSnapPoint}
      setActiveSnapPoint={setActiveSnapPoint}
      disablePreventScroll={disablePreventScroll}
      snapToSequentialPoint={snapToSequentialPoint}
      repositionInputs={repositionInputs}
    >
      <Drawer.Portal>
        {modal && <StyledOverlay $zIndex={zIndex ? zIndex - 1 : undefined} />}
        <StyledContent
          $zIndex={zIndex}
          $height={singleSnapHeight}
          onOpenAutoFocus={(e) => {
            if (!modal) e.preventDefault();
          }}
          onCloseAutoFocus={(e) => {
            if (!modal) e.preventDefault();
          }}
          onPointerDownOutside={(e) => {
            if (!modal) e.preventDefault();
          }}
          onFocusOutside={(e) => {
            if (!modal) e.preventDefault();
          }}
          onInteractOutside={(e) => {
            if (!modal) e.preventDefault();
          }}
        >
          <SheetInner>
            <DragHeader>
              <HandleBar />
            </DragHeader>
            {showCloseButton && (
              <CloseButton onClick={() => onOpenChange?.(false)}>
                <X size={18} />
              </CloseButton>
            )}
            <ContentAreaBottomSheet>{children}</ContentAreaBottomSheet>
          </SheetInner>
        </StyledContent>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

const StyledOverlay = styled(Drawer.Overlay)<{ $zIndex?: number }>`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(4px);
  z-index: ${({ $zIndex }) => $zIndex ?? 999};
`;

const StyledContent = styled(Drawer.Content)<{ $zIndex?: number; $height?: string | number }>`
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: ${({ $zIndex }) => $zIndex ?? 10000};
  outline: none;

  height: ${({ $height }) => (typeof $height === "number" ? `${$height * 100}%` : $height ?? "100%")};
  max-height: 96%;
  display: flex;
  flex-direction: column;

  max-width: 768px;
  margin: 0 auto;
  pointer-events: none;
`;

const SheetInner = styled.div`
  position: relative;
  border-radius: 32px 32px 0 0;
  background: var(--bg-base, #ffffff);
  box-shadow: 0 4px 24px 0 rgba(0, 0, 0, 0.25);
  width: 100%;
  border-top: 1px solid var(--border-default, #e5e8eb);
  overflow: hidden;
  padding-bottom: calc(16px + env(safe-area-inset-bottom, 0px));

  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  pointer-events: auto;
  touch-action: none;
`;

const DragHeader = styled.div`
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  touch-action: none;
  position: relative;
`;

const HandleBar = styled.div`
  width: 36px;
  height: 5px;
  border-radius: 999px;
  background: var(--border-default, #e5e8eb);
`;

const CloseButton = styled.button`
  position: absolute;
  top: 8px;
  right: 16px;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: var(--bg-subtle, #f2f4f6);
  color: var(--text-secondary, #4e5968);
  border: none;
  cursor: pointer;
  outline: none;
  transition: all 0.2s ease-in-out;

  &:hover {
    background: var(--border-default, #e5e8eb);
  }

  &:active {
    transform: scale(0.92);
  }
`;

const ContentAreaBottomSheet = styled.div`
  padding: 0 20px 0;
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  overflow: hidden;
`;
