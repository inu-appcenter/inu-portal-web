import { Drawer } from "vaul";
import styled from "styled-components";
import { Info } from "lucide-react";
import type { ReactNode } from "react";

interface InfoBottomSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  children?: ReactNode;
  isLoading?: boolean;
}

export default function InfoBottomSheet({
  title,
  open,
  onOpenChange,
  children,
  isLoading = false,
}: InfoBottomSheetProps) {
  return (
    <Drawer.Root
      open={open}
      onOpenChange={(nextOpen) => {
        if (isLoading && !nextOpen) return;
        onOpenChange(nextOpen);
      }}
      dismissible={!isLoading}
      modal={true}
    >
      <Drawer.Portal>
        <StyledOverlay />
        <StyledContent>
          <SheetInner>
            <DragHeader>
              <HandleBar />
            </DragHeader>

            <HeaderSection>
              <IconWrapper>
                <Info size={22} strokeWidth={2.2} />
              </IconWrapper>
              <Title>{title}</Title>
            </HeaderSection>

            <BodySection>{children}</BodySection>
          </SheetInner>
        </StyledContent>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

const StyledOverlay = styled(Drawer.Overlay)`
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.28);
  z-index: 999;
`;

const StyledContent = styled(Drawer.Content)`
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  outline: none;

  height: 90dvh;
  display: flex;

  max-width: 1024px;
  margin: 0 auto;
`;

const SheetInner = styled.div`
  background: #ffffff;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;

  border-top-left-radius: 24px;
  border-top-right-radius: 24px;

  overflow: hidden;
`;

const DragHeader = styled.div`
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const HandleBar = styled.div`
  width: 42px;
  height: 5px;
  border-radius: 999px;
  background: #d7deea;
`;

const HeaderSection = styled.div`
  padding: 8px 20px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
`;

const IconWrapper = styled.div`
  width: 52px;
  height: 52px;
  border-radius: 999px;
  background: #eef4ff;
  color: #2f6fec;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Title = styled.h2`
  margin: 0;
  font-size: 24px;
  font-weight: 800;
  color: #111827;
`;

const BodySection = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 0 20px 28px;

  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
`;
