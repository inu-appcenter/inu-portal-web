import React, { useEffect, useRef, useState } from "react";
import styled, { keyframes } from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import { X, Maximize2, Loader2 } from "lucide-react";
import { useLocation } from "react-router-dom";

interface ChatBulModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChatBulModal: React.FC<ChatBulModalProps> = ({
  isOpen,
  onClose,
}) => {
  const location = useLocation();
  const initialLocationRef = useRef(location.pathname + location.search);
  const [isIframeLoaded, setIsIframeLoaded] = useState(false);

  useEffect(() => {
    if (isOpen) {
      initialLocationRef.current = location.pathname + location.search;
      setIsIframeLoaded(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && initialLocationRef.current !== location.pathname + location.search) {
      onClose();
    }
  }, [location.pathname, location.search, isOpen, onClose]);

  const iframeSrc = `${import.meta.env.VITE_INUCHAT_URL}/?service=intip`;

  const handleFullscreen = () => {
    onClose();
    window.open(iframeSrc, "_blank", "noopener,noreferrer");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <ModalContainer>
          <Backdrop
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <ModalWrapper
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 15 }}
            transition={{ type: "spring", stiffness: 450, damping: 35 }}
          >
            <HeaderControlBar>
              <ControlButtons>
                <MaximizeButton onClick={handleFullscreen} title="새 탭으로 열기">
                  <Maximize2 size={16} />
                </MaximizeButton>
                <IconButton onClick={onClose} title="닫기">
                  <X size={18} />
                </IconButton>
              </ControlButtons>
            </HeaderControlBar>

            {!isIframeLoaded && (
              <LoadingOverlay>
                <SpinIcon size={28} />
                <LoadingText>학사 챗봇 불러오는 중...</LoadingText>
              </LoadingOverlay>
            )}

            <IframeFrame
              src={iframeSrc}
              title="학사 챗봇 챗불이"
              allow="clipboard-write; clipboard-read"
              onLoad={() => {
                setIsIframeLoaded(true);
              }}
            />
          </ModalWrapper>
        </ModalContainer>
      )}
    </AnimatePresence>
  );
};

export default ChatBulModal;

const ModalContainer = styled.div`
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 16px;

  @media (max-width: 768px) {
    padding: 0;
  }
`;

const Backdrop = styled(motion.div)`
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
`;

const ModalWrapper = styled(motion.div)`
  position: relative;
  width: 92%;
  max-width: 960px;
  height: 90vh;
  height: 90dvh;
  background: #ffffff;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  z-index: 1;
  border: 1px solid rgba(255, 255, 255, 0.8);

  @media (max-width: 768px) {
    width: 100%;
    height: 100vh;
    height: 100dvh;
    border-radius: 0;
    border: none;
    padding-top: var(--native-safe-area-inset-top, env(safe-area-inset-top, 0px));
    padding-bottom: var(--native-safe-area-inset-bottom, env(safe-area-inset-bottom, 0px));
    padding-left: var(--native-safe-area-inset-left, env(safe-area-inset-left, 0px));
    padding-right: var(--native-safe-area-inset-right, env(safe-area-inset-right, 0px));
    box-sizing: border-box;
  }
`;

const HeaderControlBar = styled.div`
  position: absolute;
  top: 12px;
  right: 14px;
  z-index: 20;
  pointer-events: auto;

  @media (max-width: 768px) {
    top: calc(var(--native-safe-area-inset-top, env(safe-area-inset-top, 0px)) + 12px);
    right: calc(var(--native-safe-area-inset-right, env(safe-area-inset-right, 0px)) + 14px);
  }
`;

const ControlButtons = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const MaximizeButton = styled.button`
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(0, 0, 0, 0.08);
  cursor: pointer;
  padding: 6px;
  color: #475569;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

  &:hover {
    background: #ffffff;
    color: #0f172a;
    transform: scale(1.05);
  }

  @media (max-width: 768px) {
    display: none;
  }
`;

const IconButton = styled.button`
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(0, 0, 0, 0.08);
  cursor: pointer;
  padding: 6px;
  color: #475569;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

  &:hover {
    background: #ffffff;
    color: #0f172a;
    transform: scale(1.05);
  }
`;

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const LoadingOverlay = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #f8faff;
  z-index: 5;
  gap: 12px;
`;

const SpinIcon = styled(Loader2)`
  animation: ${spin} 1s linear infinite;
  color: #ff6b00;
`;

const LoadingText = styled.span`
  font-size: 14px;
  font-weight: 500;
  color: #64748b;
`;

const IframeFrame = styled.iframe`
  flex: 1;
  width: 100%;
  height: 100%;
  border: none;
  background: transparent;
`;
