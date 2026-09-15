import { useEffect, useState } from "react";
import styled from "styled-components";
import { motion, AnimatePresence, Variants } from "framer-motion";
import Icon from "@/components/common/Icon";
import { chatBubbleButton as ChatBulButtonImg } from "@/resources/assets/illustrations/ai";
import { BOTTOM_NAV_SAFE_HEIGHT } from "@/containers/mobile/common/MobileBottomNav";
import { useSheetBackHandler } from "@/hooks/useSheetBackHandler";
import useAIChatStore from "@/stores/useAIChatStore";
import AIChatMenuCard from "./AIChatMenuCard";
import AgentChatModal from "@/components/mobile/chat/AgentChatModal";

interface AIChatFloatingButtonProps {
  isFloatingButtonVisible?: boolean;
}

const AIChatFloatingButton = ({
  isFloatingButtonVisible = true,
}: AIChatFloatingButtonProps) => {
  const { isOpen, isAgentOpen, closeChat, openChat, closeAgent, openAgent } =
    useAIChatStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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

  const handleButtonClick = () => {
    if (isOpen) {
      closeChat();
      return;
    }
    if (isAgentOpen) {
      closeAgent();
      return;
    }
    setIsMenuOpen((prev) => !prev);
  };

  const modalVariants: Variants = {
    hidden: { scale: 0, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 450,
        damping: 35,
        mass: 1,
        staggerChildren: 0.1,
        delayChildren: 0.05,
      },
    },
    exit: {
      scale: 0,
      opacity: 0,
      transition: {
        type: "spring",
        stiffness: 500,
        damping: 45,
        opacity: { duration: 0.15 },
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3, ease: "easeOut" },
    },
  };

  const iframeSrc = `${import.meta.env.VITE_INUCHAT_URL}/?service=intip`;

  return (
    <>
      {/* 1. New INTIP Agent Chat Modal */}
      <AgentChatModal isOpen={isAgentOpen} onClose={closeAgent} />

      {/* 2. Legacy ChatBul Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            <Backdrop
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeChat}
            />
            <ModalContainer
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <FloatingCloseButton
                onClick={closeChat}
                variants={itemVariants}
              >
                <Icon name="close-md" size={20} />
              </FloatingCloseButton>

              <IframeContainer variants={itemVariants}>
                <iframe
                  src={iframeSrc}
                  title="AI Chat"
                  width="100%"
                  height="100%"
                  allow="clipboard-write"
                />
              </IframeContainer>
            </ModalContainer>
          </>
        )}
      </AnimatePresence>

      {/* 3. Floating Button & Menu Card */}
      {isFloatingButtonVisible && (
        <FloatingButtonWrapper>
          <AIChatMenuCard
            open={isMenuOpen}
            onScrimClick={() => setIsMenuOpen(false)}
            onSelectAgent={() => {
              setIsMenuOpen(false);
              openAgent();
            }}
            onSelectLegacyChatBul={() => {
              setIsMenuOpen(false);
              openChat();
            }}
          />

          <FloatingButton
            animate={{ y: [0, -8, 0] }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            onClick={handleButtonClick}
            aria-label="AI 비서 메뉴 열기"
          >
            <img src={ChatBulButtonImg} alt="AI 챗봇" />
          </FloatingButton>
        </FloatingButtonWrapper>
      )}
    </>
  );
};

const Backdrop = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.25);
  z-index: 1001;
`;

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

const ModalContainer = styled(motion.div)`
  position: fixed;
  background: white;
  display: flex;
  flex-direction: column;
  z-index: 1003;
  border-radius: 32px;
  overflow: hidden;

  /* 강력하고 명확한 다층 그림자 */
  box-shadow:
    0 25px 50px -12px rgba(0, 0, 0, 0.35),
    0 10px 15px -3px rgba(0, 0, 0, 0.1);

  /* 더욱 선명한 테두리 */
  border: 1px solid rgba(0, 0, 0, 0.08);

  /* 하드웨어 가속 및 레이어 최적화 */
  transform: translateZ(0);
  will-change: transform, opacity;
  isolation: isolate;

  /* Mobile (Default): Origin centered on the floating button */
  top: 20px;
  bottom: 20px;
  left: 12px;
  right: 12px;
  transform-origin: calc(100% - 42px) calc(100% - 104px);

  /* Tablet & Desktop: Origin centered on the floating button */
  @media (min-width: 451px) {
    top: auto;
    left: auto;
    width: 380px;
    height: 600px;
    bottom: 90px;
    right: 20px;
    max-height: calc(100dvh - 170px);
    transform-origin: calc(100% - 30px) calc(100% - 30px);
  }

  /* PC (Large Screens): Origin at button (button is to the right of modal) */
  @media (min-width: 1024px) {
    right: calc(50% - 600px + 20px + 75px);
    bottom: 90px;
    height: 600px;
    transform-origin: calc(100% + 45px) calc(100% - 30px);
  }
`;

const FloatingCloseButton = styled(motion.button)`
  position: absolute;
  top: 12px;
  right: 12px;
  background: rgba(0, 0, 0, 0.05);
  border: none;
  color: #333;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 16px;
  transition: background 0.2s;
  z-index: 10;

  &:hover {
    background: rgba(0, 0, 0, 0.12);
  }
`;

const IframeContainer = styled(motion.div)`
  flex: 1;
  width: 100%;
  background: #f8f9fa;
  position: relative;

  /* 내부 애니메이션 성능 확보를 위한 독립 레이어 분리 */
  transform: translate3d(0, 0, 0);
  -webkit-transform: translate3d(0, 0, 0);

  iframe {
    width: 100%;
    height: 100%;
    border: none;
    display: block;
  }
`;

export default AIChatFloatingButton;
