import React, { useRef, useEffect, useState } from "react";
import styled from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Maximize2,
  PanelLeftClose,
  Menu,
  Plus,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAgentChat } from "@/hooks/useAgentChat";
import { Sidebar } from "@/components/agent/Sidebar";
import { ChatMessage } from "@/components/agent/ChatMessage";
import { ChatInput } from "@/components/agent/ChatInput";
import { GuideScreen } from "@/components/agent/GuideScreen";
import { PortalAccountModal } from "../agent/PortalAccountModal";
import { LibraryAccountModal } from "../agent/LibraryAccountModal";
import { LmsAccountModal } from "../agent/LmsAccountModal";
import { COLORS } from "@/components/agent/colors";
import ellipse2 from "@/resources/assets/illustrations/ellipse2.svg";

interface AgentChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AgentChatModal: React.FC<AgentChatModalProps> = ({
  isOpen,
  onClose,
}) => {
  const navigate = useNavigate();
  const {
    rooms,
    currentRoom,
    currentRoomId,
    setCurrentRoomId,
    isLoading,
    isSidebarOpen,
    setIsSidebarOpen,
    createNewRoom,
    deleteRoom,
    updateRoomTitle,
    clearHistory,
    stopGeneration,
    sendMessage,
  } = useAgentChat();

  const [isPortalModalOpen, setIsPortalModalOpen] = useState(false);
  const [isLibraryModalOpen, setIsLibraryModalOpen] = useState(false);
  const [isLmsModalOpen, setIsLmsModalOpen] = useState(false);
  const chatAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOpenPortalModal = () => setIsPortalModalOpen(true);
    const handleOpenLibraryModal = () => setIsLibraryModalOpen(true);
    const handleOpenLmsModal = () => setIsLmsModalOpen(true);
    window.addEventListener("openPortalAccountModal", handleOpenPortalModal);
    window.addEventListener("openLibraryAccountModal", handleOpenLibraryModal);
    window.addEventListener("openLmsAccountModal", handleOpenLmsModal);
    return () => {
      window.removeEventListener("openPortalAccountModal", handleOpenPortalModal);
      window.removeEventListener("openLibraryAccountModal", handleOpenLibraryModal);
      window.removeEventListener("openLmsAccountModal", handleOpenLmsModal);
    };
  }, []);

  useEffect(() => {
    if (chatAreaRef.current && isOpen) {
      chatAreaRef.current.scrollTo({
        top: chatAreaRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [currentRoom.messages, isOpen]);

  const handleFullscreen = () => {
    onClose();
    navigate("/agent");
  };

  const handleSelectRoom = (id: string) => {
    setCurrentRoomId(id);
    if (window.innerWidth <= 768) setIsSidebarOpen(false);
  };

  const handleNewChat = () => {
    createNewRoom();
    if (window.innerWidth <= 768) setIsSidebarOpen(false);
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
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
              {/* 모달 내 사이드바 */}
              <Sidebar
                isOpen={isSidebarOpen}
                rooms={rooms}
                currentRoomId={currentRoomId}
                onSelectRoom={handleSelectRoom}
                onNewChat={handleNewChat}
                onDeleteRoom={deleteRoom}
                onUpdateRoomTitle={updateRoomTitle}
                onClearHistory={clearHistory}
                onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
              />

              {/* UNIDorm-AIChat-Web MainArea 1:1 복사 */}
              <MainArea>
                <AmbientOrb src={ellipse2} alt="" />

                {/* Header */}
                <HeaderContainer>
                  <HeaderLeft>
                    <IconButton
                      onClick={() => setIsSidebarOpen((prev) => !prev)}
                      title="사이드바 토글"
                    >
                      {isSidebarOpen ? (
                        <PanelLeftClose size={20} />
                      ) : (
                        <Menu size={20} />
                      )}
                    </IconButton>
                    <HeaderTitleContainer>
                      <HeaderTitle>
                        <span>인팁 비서</span>
                        <BetaBadge>AI</BetaBadge>
                      </HeaderTitle>
                    </HeaderTitleContainer>
                  </HeaderLeft>

                  <HeaderRight>
                    <IconButton onClick={handleNewChat} title="새로운 대화">
                      <Plus size={22} />
                    </IconButton>
                    <IconButton
                      onClick={handleFullscreen}
                      title="전체 화면으로 열기"
                    >
                      <Maximize2 size={18} />
                    </IconButton>
                    <IconButton onClick={onClose} title="닫기">
                      <X size={20} />
                    </IconButton>
                  </HeaderRight>
                </HeaderContainer>

                {/* UNIDorm-AIChat-Web ChatArea 1:1 복사 */}
                <ChatArea ref={chatAreaRef}>
                  {currentRoom.messages.length === 0 ? (
                    <GuideScreen onSelectSuggestion={(q) => sendMessage(q)} />
                  ) : (
                    currentRoom.messages.map((msg) => (
                      <ChatMessage
                        key={msg.id}
                        message={msg}
                        onChipClick={(chip) => sendMessage(chip)}
                      />
                    ))
                  )}
                </ChatArea>

                {/* UNIDorm-AIChat-Web ChatInput 1:1 복사 */}
                <ChatInput
                  onSendMessage={sendMessage}
                  isLoading={isLoading}
                  onStopGeneration={stopGeneration}
                />
              </MainArea>
            </ModalWrapper>
          </>
        )}
      </AnimatePresence>

      <PortalAccountModal
        isOpen={isPortalModalOpen}
        onClose={() => setIsPortalModalOpen(false)}
        onSuccess={() => setIsPortalModalOpen(false)}
      />
      <LibraryAccountModal
        isOpen={isLibraryModalOpen}
        onClose={() => setIsLibraryModalOpen(false)}
        onSuccess={() => setIsLibraryModalOpen(false)}
      />
      <LmsAccountModal
        isOpen={isLmsModalOpen}
        onClose={() => setIsLmsModalOpen(false)}
        onSuccess={() => setIsLmsModalOpen(false)}
      />
    </>
  );
};

export default AgentChatModal;

const Backdrop = styled(motion.div)`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  z-index: 9998;
`;

const ModalWrapper = styled(motion.div)`
  position: fixed;
  top: 4%;
  left: 50%;
  transform: translateX(-50%);
  width: 92%;
  max-width: 960px;
  height: 90vh;
  height: 90dvh;
  background: linear-gradient(
    163.11deg,
    rgb(240, 240, 255) 10.193%,
    rgb(253, 253, 255) 111.84%
  );
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  display: flex;
  overflow: hidden;
  z-index: 9999;
  border: 1px solid rgba(255, 255, 255, 0.8);
  font-family:
    "Pretendard",
    -apple-system,
    BlinkMacSystemFont,
    system-ui,
    Roboto,
    sans-serif;

  @media (max-width: 768px) {
    top: 0;
    left: 0;
    transform: none;
    width: 100%;
    height: 100vh;
    height: 100dvh;
    border-radius: 0;
  }
`;

const MainArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
`;

const AmbientOrb = styled.img`
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translate(-50%, 30%);
  width: 512px;
  max-width: 120vw;
  height: auto;
  aspect-ratio: 512 / 549.5;
  pointer-events: none;
  z-index: 0;
  opacity: 0.6;
`;

const HeaderContainer = styled.div`
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  background-color: transparent;
  color: ${COLORS.textDark};
  z-index: 10;
  position: relative;
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const HeaderTitleContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const HeaderTitle = styled.div`
  font-size: 18px;
  font-weight: 700;
  letter-spacing: -0.5px;
  display: flex;
  align-items: center;
  gap: 8px;
  user-select: none;
  color: ${COLORS.textDark};
`;

const BetaBadge = styled.span`
  background: linear-gradient(142deg, #007aff 26.94%, #570099 87.68%);
  color: #fafafa;
  font-size: 11px;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 6px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-left: 2px;
`;

const IconButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px;
  color: ${COLORS.textDark};
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const ChatArea = styled.div`
  flex: 1;
  overflow-y: auto;
  overflow-anchor: none;
  scrollbar-gutter: stable;
  padding: 10px 20px 100px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 1;

  will-change: scroll-position;
  transform: translateZ(0);
  overscroll-behavior-y: contain;

  scrollbar-width: auto;
  scrollbar-color: rgba(0, 0, 0, 0.3) transparent;

  &::-webkit-scrollbar {
    width: 14px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.25);
    border-radius: 9999px;
    border: 2px solid transparent;
    background-clip: content-box;
  }
  &::-webkit-scrollbar-thumb:hover {
    background: rgba(0, 0, 0, 0.45);
    background-clip: content-box;
  }
`;
