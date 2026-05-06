import * as Dialog from "@radix-ui/react-dialog";
import styled, { keyframes } from "styled-components";
import Box from "@/components/common/Box";
import BottomButtonGroup from "@/components/common/BottomButtonGroup";
import { useState, useEffect } from "react";

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

interface ImageUploadModalProps {
  files: File[];
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSend: () => void;
  onCancel: () => void;
}

export default function ImageUploadModal({
  files,
  isOpen,
  onOpenChange,
  onSend,
  onCancel,
}: ImageUploadModalProps) {
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  useEffect(() => {
    if (files.length > 0) {
      const urls = files.map((file) => URL.createObjectURL(file));
      setPreviewUrls(urls);
      return () => urls.forEach((url) => URL.revokeObjectURL(url));
    } else {
      setPreviewUrls([]);
    }
  }, [files]);

  if (previewUrls.length === 0 && isOpen) return null;

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
              <Title>이 이미지로 보낼까요?</Title>
            </Header>
            <ImageArea>
              <ImageContainer>
                <img src={previewUrls[0]} alt="업로드 대기 이미지" />
                {previewUrls.length > 1 && (
                  <CountBadge>외 {previewUrls.length - 1}장</CountBadge>
                )}
              </ImageContainer>
            </ImageArea>
            <BottomButtonGroup
              leftButton={{
                label: "취소",
                onClick: onCancel,
                backgroundColor: "#F2F2F7",
                textColor: "#1C1C1E",
              }}
              rightButton={{
                label: "보내기",
                onClick: onSend,
                backgroundColor: "#5844E4",
                textColor: "#FFFFFF",
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
  z-index: 1000;
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

const Header = styled.div`
  padding: 24px 24px 16px;
`;

const Title = styled.h2`
  font-size: 18px;
  font-weight: 600;
  color: #1c1c1e;
  margin: 0;
  text-align: left;
`;

const ImageArea = styled.div`
  padding: 0 24px 8px;
  display: flex;
  justify-content: center;
`;

const ImageContainer = styled.div`
  position: relative;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 12px;
  overflow: hidden;
  background-color: #f2f2f7;

  img {
    max-width: 100%;
    max-height: 40vh;
    object-fit: contain;
    border-radius: 8px;
  }
`;

const CountBadge = styled.div`
  position: absolute;
  bottom: 8px;
  right: 8px;
  background-color: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
`;
