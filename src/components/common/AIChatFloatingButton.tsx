import { useEffect } from "react";
import styled from "styled-components";
import { motion } from "framer-motion";
import { chatBubbleButton as ChatBulButtonImg } from "@/resources/assets/illustrations/ai";
import { BOTTOM_NAV_SAFE_HEIGHT } from "@/containers/mobile/common/MobileBottomNav";
import { useSheetBackHandler } from "@/hooks/useSheetBackHandler";
import useAIChatStore from "@/stores/useAIChatStore";
// [임시 조치 보관용 import]
// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
import AgentFloatingBottomSheet from "@/components/mobile/chat/AgentFloatingBottomSheet";
import ChatBulModal from "@/components/mobile/chat/ChatBulModal";

interface AIChatFloatingButtonProps {
  isFloatingButtonVisible?: boolean;
}

const AIChatFloatingButton = ({
  isFloatingButtonVisible = true,
}: AIChatFloatingButtonProps) => {
  // [임시 조치 보관용]
  // const navigate = useNavigate();
  // const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isOpen, isAgentOpen, closeChat, closeAgent, openAgent } =
    useAIChatStore();

  useSheetBackHandler(isOpen || isAgentOpen, () => {
    if (isOpen) closeChat();
    if (isAgentOpen) closeAgent();
  });

  useEffect(() => {
    if (isOpen || isAgentOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen, isAgentOpen]);

  // 에이전트 내 링크 클릭 후 상세 페이지에서 뒤로가기(popstate)로 복귀 시 에이전트 창 자동 복원
  useEffect(() => {
    const handlePopState = () => {
      const shouldResume = sessionStorage.getItem("INTIP_AGENT_RESUME_ON_BACK") === "true";
      if (shouldResume) {
        sessionStorage.removeItem("INTIP_AGENT_RESUME_ON_BACK");
        sessionStorage.setItem("INTIP_AGENT_SHOULD_RESTORE", "true");
        setTimeout(() => {
          openAgent();
        }, 60);
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [openAgent]);

  const handleButtonClick = () => {
    if (isAgentOpen) {
      closeAgent();
      sessionStorage.removeItem("INTIP_AGENT_RESUME_ON_BACK");
      sessionStorage.removeItem("INTIP_AGENT_SHOULD_RESTORE");
      sessionStorage.removeItem("INTIP_AGENT_PREV_STATE");
      return;
    }
    if (isOpen) {
      closeChat();
      return;
    }
    // 플로팅 버튼을 직접 눌러 열 때는 항상 깨끗한 새 질문 세션으로 시작
    sessionStorage.removeItem("INTIP_AGENT_RESUME_ON_BACK");
    sessionStorage.removeItem("INTIP_AGENT_SHOULD_RESTORE");
    sessionStorage.removeItem("INTIP_AGENT_PREV_STATE");
    openAgent();
  };

  return (
    <>
      {/* 1. New INTIP Agent Floating BottomSheet (Bixby / Gemini Style) */}
      <AgentFloatingBottomSheet isOpen={isAgentOpen} onClose={closeAgent} />

      {/* 2. ChatBul Academic Chat Modal (인팁 캠퍼스 비서와 동일한 레이아웃 & 노출 방식 적용) */}
      <ChatBulModal isOpen={isOpen} onClose={closeChat} />

      {/* 3. Floating Button & Menu Card */}
      {isFloatingButtonVisible && (
        <FloatingButtonWrapper>
          {/* [임시 조치] 옵션 메뉴 UI 보관
          <AIChatMenuCard
            open={isMenuOpen}
            onScrimClick={() => setIsMenuOpen(false)}
            onSelectAgent={() => {
              setIsMenuOpen(false);
              if (window.innerWidth <= 768) {
                navigate("/agent");
              } else {
                openAgent();
              }
            }}
            onSelectLegacyChatBul={() => {
              setIsMenuOpen(false);
              openChat();
            }}
          />
          */}

          <FloatingButton
            animate={{ y: [0, -8, 0] }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            onClick={handleButtonClick}
            aria-label="학사 챗봇 챗불이 열기"
          >
            <img src={ChatBulButtonImg} alt="학사 챗봇 챗불이" />
          </FloatingButton>
        </FloatingButtonWrapper>
      )}
    </>
  );
};

const FloatingButtonWrapper = styled.div`
  position: fixed;
  bottom: calc(${BOTTOM_NAV_SAFE_HEIGHT} + 12px);
  right: 15px;
  width: 75px;
  height: 75px;
  z-index: 1002;

  @media (min-width: 1024px) {
    bottom: 85px;
    right: calc(50% - 600px + 15px);
  }
`;

const FloatingButton = styled(motion.button)`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  cursor: pointer;
  filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.25));

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
`;

export default AIChatFloatingButton;
