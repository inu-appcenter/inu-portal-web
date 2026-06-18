import React from "react";
import styled from "styled-components";
import { Drawer } from "vaul";

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
}

export default function BottomSheet({
  open,
  onOpenChange,
  children,
  snapPoints,
  activeSnapPoint,
  setActiveSnapPoint,
  modal = true,
  dismissible = true,
  disablePreventScroll = true,
  snapToSequentialPoint = true,
}: BottomSheetProps) {
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
    >
      <Drawer.Portal>
        {modal && <StyledOverlay />}
        <StyledContent>
          <SheetInner>
            <DragHeader>
              <HandleBar />
            </DragHeader>
            <ContentAreaBottomSheet>
              {children}
            </ContentAreaBottomSheet>
          </SheetInner>
        </StyledContent>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

const StyledOverlay = styled(Drawer.Overlay)`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(4px);
  z-index: 999;
`;

const StyledContent = styled(Drawer.Content)`
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 10000;
  outline: none;

  height: 100%;
  max-height: 96%;
  display: flex;
  flex-direction: column;

  max-width: 768px;
  margin: 0 auto;
  pointer-events: none;
`;

const SheetInner = styled.div`
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
`;

const HandleBar = styled.div`
  width: 36px;
  height: 5px;
  border-radius: 999px;
  background: var(--border-default, #e5e8eb);
`;

const ContentAreaBottomSheet = styled.div`
  padding: 0 20px 0;
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  overflow: hidden;
`;
