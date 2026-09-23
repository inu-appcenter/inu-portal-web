import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
import styled, { keyframes } from "styled-components";
import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import { useAgentBridge, AIState } from "@/hooks/useAgentBridge";
import { PortalAccountModal } from "@/components/mobile/agent/PortalAccountModal";

interface AgentFloatingBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AgentFloatingBottomSheet: React.FC<AgentFloatingBottomSheetProps> = ({
  isOpen,
  onClose,
}) => {
  const location = useLocation();
  const initialLocationRef = useRef(location.pathname + location.search);
  const [isDragging, setIsDragging] = useState(false);

  // 내부 브릿지 훅
  const {
    iframeRef,
    isPortalModalOpen,
    setIsPortalModalOpen,
    sendClientContextToIframe,
    aiState,
    setAiState,
    sendHostCommand,
  } = useAgentBridge({
    onClose: () => {
      onClose();
    },
  });

  // 부모 isOpen 상태 변경 시 처리
  useEffect(() => {
    if (isOpen) {
      initialLocationRef.current = location.pathname + location.search;
      if (aiState === "closed") {
        setAiState("listening");
        sendHostCommand("TRIGGER_OPEN");
      }
    } else {
      if (aiState !== "closed") {
        setAiState("closed");
        sendHostCommand("FORCE_CLOSE");
      }
    }
  }, [isOpen, aiState, sendHostCommand, setAiState]);

  // 페이지 이동 시 자동 닫기
  useEffect(() => {
    if (isOpen && initialLocationRef.current !== location.pathname + location.search) {
      onClose();
    }
  }, [location.pathname, location.search, isOpen, onClose]);

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

  const iframeSrc = useMemo(() => {
    return `${resolvedAgentUrl}?token=${encodeURIComponent(authToken)}&client=INTIP&mode=floating`;
  }, [resolvedAgentUrl, authToken]);

  // 바텀시트 상태별 높이 계산
  const getSheetHeight = useCallback((state: AIState): string => {
    switch (state) {
      case "listening":
      case "recognized":
        return "105px";
      case "thinking":
        return "240px";
      case "answering":
        return "min(760px, 82dvh)";
      case "expanded":
        return "100dvh";
      case "closed":
      default:
        return "0px";
    }
  }, []);

  const currentHeight = getSheetHeight(isOpen ? aiState : "closed");
  const isSheetOpen = isOpen && aiState !== "closed";
  const isAmbientGlowActive =
    isOpen &&
    (aiState === "listening" || aiState === "recognized" || aiState === "thinking");
  const isExpanded = aiState === "expanded";

  // 드래그 제스처 핸들러 (Half ↔ Full)
  const dragStartYRef = useRef<number>(0);

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    dragStartYRef.current = e.clientY;
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setIsDragging(false);
    const deltaY = e.clientY - dragStartYRef.current;

    if (deltaY < -40) {
      // 위로 드래그 -> 전체화면 확장
      setAiState("expanded");
      sendHostCommand("SET_EXPANDED");
    } else if (deltaY > 50) {
      // 아래로 드래그 -> 전체화면이면 Half로 축소, Half면 닫기
      if (aiState === "expanded") {
        setAiState("answering");
        sendHostCommand("SET_HALF");
      } else {
        onClose();
      }
    }
  };

  const handleScrimClick = () => {
    onClose();
  };

  if (!isOpen && aiState === "closed") {
    return null;
  }

  return (
    <>
      {/* 1. 배경 딤 (Scrim - 플로팅 입력창 상태에서도 외부 터치 시 즉시 닫기 지원) */}
      <Scrim
        $active={isSheetOpen}
        $state={aiState}
        onClick={handleScrimClick}
        initial={{ opacity: 0 }}
        animate={{ opacity: isSheetOpen ? 1 : 0 }}
        transition={{ duration: 0.2 }}
      />

      {/* 2. 하단 에지 라이팅 (Ambient Edge Glow) */}
      <AmbientEdgeGlow $active={isAmbientGlowActive} />

      {/* 3. 플로팅 시트 컨테이너 (#ai-sheet-container) */}
      <SheetContainer
        id="ai-sheet-container"
        $height={currentHeight}
        $isExpanded={isExpanded}
        $isDragging={isDragging}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
      >
        {/* Child iframe */}
        <IframeWrapper $isDragging={isDragging}>
          <StyledIframe
            ref={iframeRef}
            src={iframeSrc}
            title="INU AI Campus Assistant Floating Sheet"
            allow="clipboard-write; clipboard-read; microphone"
            onLoad={() => {
              sendClientContextToIframe();
            }}
          />
        </IframeWrapper>
      </SheetContainer>

      {/* 학적/포털 연동 계정 모달 */}
      <PortalAccountModal
        isOpen={isPortalModalOpen}
        onClose={() => setIsPortalModalOpen(false)}
        onSuccess={() => {
          setIsPortalModalOpen(false);
          sendClientContextToIframe(true);
        }}
      />
    </>
  );
};

export default AgentFloatingBottomSheet;

/* --- Animations & Styled Components --- */

const pulseGlow = keyframes`
  0% {
    opacity: 0.6;
    transform: scaleX(0.96) translateY(0);
    filter: blur(24px) saturate(1.4);
  }
  50% {
    opacity: 1;
    transform: scaleX(1.04) translateY(-3px);
    filter: blur(32px) saturate(2);
  }
  100% {
    opacity: 0.6;
    transform: scaleX(0.96) translateY(0);
    filter: blur(24px) saturate(1.4);
  }
`;

const Scrim = styled(motion.div)<{ $active: boolean; $state: AIState }>`
  position: fixed;
  inset: 0;
  background: ${({ $state }) =>
    $state === "listening" || $state === "recognized"
      ? "rgba(0, 0, 0, 0.2)"
      : "rgba(0, 0, 0, 0.45)"};
  backdrop-filter: ${({ $state }) =>
    $state === "listening" || $state === "recognized"
      ? "blur(2px)"
      : "blur(6px)"};
  -webkit-backdrop-filter: ${({ $state }) =>
    $state === "listening" || $state === "recognized"
      ? "blur(2px)"
      : "blur(6px)"};
  z-index: 9990;
  pointer-events: ${({ $active }) => ($active ? "auto" : "none")};
  transition: opacity 0.25s ease, background 0.25s ease;
`;

const AmbientEdgeGlow = styled.div<{ $active: boolean }>`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 24px;
  background: linear-gradient(
    90deg,
    #00f2fe 0%,
    #4facfe 25%,
    #7f00ff 50%,
    #e100ff 75%,
    #ff0844 100%
  );
  border-radius: 9999px 9999px 0 0;
  z-index: 9995;
  pointer-events: none;
  opacity: ${({ $active }) => ($active ? 1 : 0)};
  transform: ${({ $active }) => ($active ? "translateY(0)" : "translateY(20px)")};
  animation: ${pulseGlow} 2.5s infinite ease-in-out;
  transition: opacity 0.35s ease, transform 0.35s ease;
`;

const SheetContainer = styled.div<{
  $height: string;
  $isExpanded: boolean;
  $isDragging: boolean;
}>`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  margin: 0 auto;
  width: 100%;
  max-width: ${({ $isExpanded }) => ($isExpanded ? "100%" : "680px")};
  height: ${({ $height }) => $height};
  background: transparent;
  border-radius: ${({ $isExpanded }) => ($isExpanded ? "0" : "28px 28px 0 0")};
  z-index: 9999;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  will-change: height, transform;
  transition: height 0.38s cubic-bezier(0.16, 1, 0.3, 1),
    border-radius 0.3s cubic-bezier(0.16, 1, 0.3, 1),
    max-width 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  box-sizing: border-box;
  touch-action: none;

  @media (max-width: 768px) {
    max-width: 100%;
    padding-bottom: var(--native-safe-area-inset-bottom, env(safe-area-inset-bottom, 0px));
  }
`;

const IframeWrapper = styled.div<{ $isDragging: boolean }>`
  flex: 1;
  width: 100%;
  height: 100%;
  position: relative;
  background: transparent;
  pointer-events: ${({ $isDragging }) => ($isDragging ? "none" : "auto")};
`;

const StyledIframe = styled.iframe`
  width: 100%;
  height: 100%;
  border: none;
  background: transparent;
  display: block;
`;
