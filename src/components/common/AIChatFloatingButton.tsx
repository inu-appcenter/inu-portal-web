import { useState, useEffect } from "react";
import styled from "styled-components";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { X, Sparkles } from "lucide-react";
import useUserStore from "@/stores/useUserStore";

const AIChatFloatingButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(() => {
    const stored = localStorage.getItem("showPortalAIChatTooltip");
    return stored !== "false";
  });

  const { tokenInfo } = useUserStore();
  const accessToken = tokenInfo.accessToken;

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      if (showTooltip) {
        setShowTooltip(false);
        localStorage.setItem("showPortalAIChatTooltip", "false");
      }
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen, showTooltip]);

  const handleCloseTooltip = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowTooltip(false);
    localStorage.setItem("showPortalAIChatTooltip", "false");
  };

  const handleToggleChat = () => {
    setIsOpen(!isOpen);
  };

  const modalVariants: Variants = {
    hidden: { scale: 0.9, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 30,
      },
    },
    exit: {
      scale: 0.9,
      opacity: 0,
      transition: {
        duration: 0.2,
      },
    },
  };

  const isProd = import.meta.env.VITE_API_BASE_URL?.includes("portal.inuappcenter.kr");
  const mode = isProd ? "prod" : "dev";
  const iframeSrc = `https://aichat.unidorm.inuappcenter.kr/?token=${accessToken || ""}&mode=${mode}&service=intip`;

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            <Backdrop
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />
            <ModalContainer
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <FloatingCloseButton onClick={() => setIsOpen(false)}>
                <X size={20} />
              </FloatingCloseButton>

              <IframeContainer>
                <iframe
                  src={iframeSrc}
                  title="AI Chat"
                  width="100%"
                  height="100%"
                  allow="clipboard-write"
                  style={{ border: "none" }}
                />
              </IframeContainer>
            </ModalContainer>
          </>
        )}
      </AnimatePresence>

      <FloatingButtonContainer>
        {showTooltip && (
          <TooltipContainer
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <TooltipBubble>
              <span>학사 질문은 저에게 해보세요!</span>
              <CloseTooltipButton onClick={handleCloseTooltip}>&times;</CloseTooltipButton>
            </TooltipBubble>
            <TooltipArrow />
          </TooltipContainer>
        )}
        <FloatingButton
          onClick={handleToggleChat}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          animate={{ y: [0, -6, 0] }}
          transition={{
            y: {
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }
          }}
          aria-label="학사 AI 챗봇 열기"
        >
          <Sparkles size={24} color="#ffffff" />
        </FloatingButton>
      </FloatingButtonContainer>
    </>
  );
};

export default AIChatFloatingButton;

const Backdrop = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.4);
  z-index: 9998;
  backdrop-filter: blur(4px);
`;

const ModalContainer = styled(motion.div)`
  position: fixed;
  top: 50dvh;
  left: 50dvw;
  transform: translate(-50%, -50%) !important;
  width: 90vw;
  height: 80dvh;
  max-width: 440px;
  max-height: 720px;
  background-color: #ffffff;
  border-radius: 24px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  z-index: 9999;
  display: flex;
  flex-direction: column;

  @media (max-width: 480px) {
    width: 100dvw;
    height: 100dvh;
    max-width: none;
    max-height: none;
    border-radius: 0;
    top: 0;
    left: 0;
    transform: none !important;
  }
`;

const FloatingCloseButton = styled.button`
  position: absolute;
  top: 16px;
  right: 16px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10000;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  color: #333333;
  transition: all 0.2s ease;

  &:hover {
    background-color: #ffffff;
    transform: scale(1.05);
  }
`;

const IframeContainer = styled.div`
  width: 100%;
  height: 100%;
  flex: 1;
  background-color: #ffffff;
`;

const FloatingButtonContainer = styled.div`
  position: fixed;
  bottom: 24px;
  right: 24px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
  z-index: 9997;
`;

const FloatingButton = styled(motion.button)`
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 16px rgba(16, 185, 129, 0.3);
  outline: none;
  
  &:focus {
    outline: none;
  }
`;

const TooltipContainer = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  margin-bottom: 4px;
`;

const TooltipBubble = styled.div`
  background-color: #333333;
  color: #ffffff;
  padding: 8px 14px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: -apple-system, sans-serif;
`;

const CloseTooltipButton = styled.button`
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
  cursor: pointer;
  padding: 0;
  line-height: 1;
  
  &:hover {
    color: #ffffff;
  }
`;

const TooltipArrow = styled.div`
  width: 0;
  height: 0;
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-top: 6px solid #333333;
  margin-right: 22px;
`;
