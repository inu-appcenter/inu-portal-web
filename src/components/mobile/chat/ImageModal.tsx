import * as Dialog from "@radix-ui/react-dialog";
import styled, { keyframes } from "styled-components";
import { X } from "lucide-react";

const contentShow = keyframes`
  from { opacity: 0; transform: translate(-50%, -48%) scale(0.96); }
  to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
`;

const contentHide = keyframes`
  from { opacity: 1; transform: translate(-50%, -50%) scale(1); }
  to { opacity: 0; transform: translate(-50%, -48%) scale(0.96); }
`;

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const fadeOut = keyframes`
  from { opacity: 1; }
  to { opacity: 0; }
`;

interface ImageModalProps {
  imageUrl: string | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ImageModal({
  imageUrl,
  isOpen,
  onOpenChange,
}: ImageModalProps) {
  if (!imageUrl) return null;

  return (
    <Dialog.Root open={isOpen} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <StyledOverlay />
        <StyledContent>
          <CloseButton onClick={() => onOpenChange(false)}>
            <X size={24} color="#FFF" />
          </CloseButton>
          <ImageContainer>
            <img src={imageUrl} alt="원본 이미지" />
          </ImageContainer>
        </StyledContent>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

const StyledOverlay = styled(Dialog.Overlay)`
  position: fixed;
  inset: 0;
  z-index: 1000;
  background-color: rgba(0, 0, 0, 0.85);

  &[data-state="open"] {
    animation: ${fadeIn} 200ms ease-out;
  }

  &[data-state="closed"] {
    animation: ${fadeOut} 200ms ease-in;
  }
`;

const StyledContent = styled(Dialog.Content)`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 95vw;
  max-width: 600px;
  max-height: 90vh;
  z-index: 1001;
  display: flex;
  flex-direction: column;
  outline: none;

  &[data-state="open"] {
    animation: ${contentShow} 200ms cubic-bezier(0.16, 1, 0.3, 1);
  }

  &[data-state="closed"] {
    animation: ${contentHide} 200ms cubic-bezier(0.16, 1, 0.3, 1);
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: -40px;
  right: 0;
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
`;

const ImageContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  border-radius: 12px;

  img {
    max-width: 100%;
    max-height: 80vh;
    object-fit: contain;
    border-radius: 8px;
  }
`;
