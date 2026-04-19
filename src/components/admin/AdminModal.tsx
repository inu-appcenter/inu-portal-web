import React, { ReactNode } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import styled, { keyframes } from "styled-components";
import { X } from "lucide-react";

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
}

const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
}) => {
  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <StyledOverlay />
        <ModalContainer>
          <ModalWrapper>
            <StyledContent>
              <Header>
                <div>
                  <Title>{title}</Title>
                  {description && (
                    <DescriptionText>
                      {description}
                    </DescriptionText>
                  )}
                </div>
                <CloseButton onClick={onClose}>
                  <X size={20} />
                </CloseButton>
              </Header>

              <Content>{children}</Content>

              {footer && <Footer>{footer}</Footer>}
            </StyledContent>
          </ModalWrapper>
        </ModalContainer>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default AdminModal;

const contentShow = keyframes`
  from { opacity: 0; transform: scale(0.96); }
  to { opacity: 1; transform: scale(1); }
`;

const contentHide = keyframes`
  from { opacity: 1; transform: scale(1); }
  to { opacity: 0; transform: scale(0.96); }
`;

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const fadeOut = keyframes`
  from { opacity: 1; }
  to { opacity: 0; }
`;

const StyledOverlay = styled(Dialog.Overlay)`
  position: fixed;
  inset: 0;
  background-color: rgba(15, 23, 42, 0.4);
  backdrop-filter: blur(4px);
  z-index: 1000;

  &[data-state="open"] {
    animation: ${fadeIn} 200ms ease-out;
  }

  &[data-state="closed"] {
    animation: ${fadeOut} 200ms ease-in;
  }
`;

const ModalContainer = styled.div`
  position: fixed;
  inset: 0;
  z-index: 1001;
  overflow-y: auto;
  pointer-events: none;
`;

const ModalWrapper = styled.div`
  display: flex;
  min-height: 100%;
  align-items: center;
  justify-content: center;
  padding: 16px;
  text-align: center;
`;

const StyledContent = styled(Dialog.Content)`
  width: 100%;
  max-width: 500px;
  background-color: #ffffff;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  display: inline-block;
  vertical-align: middle;
  text-align: left;
  pointer-events: auto;
  outline: none;

  &[data-state="open"] {
    animation: ${contentShow} 300ms cubic-bezier(0.16, 1, 0.3, 1);
  }

  &[data-state="closed"] {
    animation: ${contentHide} 200ms cubic-bezier(0.16, 1, 0.3, 1);
  }
`;

const Header = styled.div`
  padding: 24px 24px 16px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  border-bottom: 1px solid #f1f5f9;
`;

const Title = styled(Dialog.Title)`
  margin: 0;
  color: #0f172a;
  font-size: 1.25rem;
  font-weight: 700;
`;

const DescriptionText = styled(Dialog.Description)`
  margin: 4px 0 0;
  color: #64748b;
  font-size: 0.875rem;
  line-height: 1.5;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #94a3b8;
  padding: 4px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: #f1f5f9;
    color: #475569;
  }
`;

const Content = styled.div`
  padding: 24px;
  max-height: 70vh;
  overflow-y: auto;
`;

const Footer = styled.div`
  padding: 16px 24px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  background-color: #f8fafc;
  border-top: 1px solid #f1f5f9;
`;
