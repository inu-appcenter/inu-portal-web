import React, { useEffect, useRef, useState, useMemo } from "react";
import styled, { keyframes } from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import { X, Maximize2, Loader2 } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

interface AgentChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AgentChatModal: React.FC<AgentChatModalProps> = ({
  isOpen,
  onClose,
}) => {
  const navigate = useNavigate();
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

  // Listen for INTIP_NAVIGATE / Action messages from the AI Agent Webview/Iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      try {
        const data = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
        if (data?.type === "INTIP_NAVIGATE" && data?.url) {
          onClose();
          if (data.url.startsWith("http://") || data.url.startsWith("https://")) {
            window.open(data.url, "_blank", "noopener,noreferrer");
          } else {
            navigate(data.url);
          }
        }
      } catch {}
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [navigate, onClose]);

  const authToken =
    localStorage.getItem("accessToken") ||
    localStorage.getItem("token") ||
    sessionStorage.getItem("accessToken") ||
    "";

  const resolvedAgentUrl = useMemo(() => {
    let url = import.meta.env.VITE_AGENT_WEB_URL || "https://inu-agent.inuappcenter.kr";
    if (url.includes("localhost") && window.location.hostname && window.location.hostname !== "localhost") {
      url = url.replace("localhost", window.location.hostname);
    }
    return url;
  }, []);

  const iframeSrc = `${resolvedAgentUrl}?token=${encodeURIComponent(authToken)}&client=INTIP`;

  const handleFullscreen = () => {
    onClose();
    if (resolvedAgentUrl.startsWith("http://") || resolvedAgentUrl.startsWith("https://")) {
      window.open(iframeSrc, "_blank", "noopener,noreferrer");
    } else {
      navigate("/agent");
    }
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
                <IconButton onClick={handleFullscreen} title="새 탭으로 열기">
                  <Maximize2 size={16} />
                </IconButton>
                <IconButton onClick={onClose} title="닫기">
                  <X size={18} />
                </IconButton>
              </ControlButtons>
            </HeaderControlBar>

            {!isIframeLoaded && (
              <LoadingOverlay>
                <SpinIcon size={28} />
                <LoadingText>캠퍼스 비서 불러오는 중...</LoadingText>
              </LoadingOverlay>
            )}

            <IframeFrame
              src={iframeSrc}
              title="INU AI Campus Assistant"
              allow="clipboard-write; clipboard-read"
              onLoad={() => setIsIframeLoaded(true)}
            />
          </ModalWrapper>
        </ModalContainer>
      )}
    </AnimatePresence>
  );
};

export default AgentChatModal;

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
  }
`;

const HeaderControlBar = styled.div`
  position: absolute;
  top: 12px;
  right: 14px;
  z-index: 20;
  pointer-events: auto;
`;

const ControlButtons = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
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
  color: #2563eb;
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

