import React, { useRef, useEffect, useState } from "react";
import styled from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Maximize2,
  PanelLeft,
  RotateCcw,
  Sparkles,
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
  const scrollRef = useRef<HTMLDivElement>(null);

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

  // 메시지 업데이트 시 스크롤
  useEffect(() => {
    if (scrollRef.current && isOpen) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [currentRoom.messages, isOpen]);

  const handleFullscreen = () => {
    onClose();
    navigate("/agent");
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
              {/* 모달 내부 사이드바 (채팅 이력 및 대화방 목록) */}
              <Sidebar
                isOpen={isSidebarOpen}
                rooms={rooms}
                currentRoomId={currentRoomId}
                onSelectRoom={(id) => {
                  setCurrentRoomId(id);
                  if (window.innerWidth <= 768) setIsSidebarOpen(false);
                }}
                onNewChat={() => {
                  createNewRoom();
                  if (window.innerWidth <= 768) setIsSidebarOpen(false);
                }}
                onDeleteRoom={deleteRoom}
                onUpdateRoomTitle={updateRoomTitle}
                onClearHistory={clearHistory}
                onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
              />

              {/* 모달 메인 채팅 영역 */}
              <ChatAreaContainer>
                <ModalHeader>
                  <HeaderLeft>
                    <IconButton
                      type="button"
                      onClick={() => setIsSidebarOpen((prev) => !prev)}
                      title="대화 목록 (사이드바)"
                    >
                      <PanelLeft size={18} />
                    </IconButton>
                    <HeaderTitleGroup>
                      <TitleRow>
                        <TitleText>인팁 캠퍼스 비서</TitleText>
                        <BetaBadge>AI</BetaBadge>
                        <InuAiTag>
                          <Sparkles size={11} /> inuai 학사 RAG
                        </InuAiTag>
                      </TitleRow>
                      <SubtitleText>{currentRoom.title || "새로운 대화"}</SubtitleText>
                    </HeaderTitleGroup>
                  </HeaderLeft>

                  <HeaderRight>
                    <IconButton
                      type="button"
                      onClick={createNewRoom}
                      title="새 대화 시작"
                    >
                      <RotateCcw size={16} />
                    </IconButton>
                    <IconButton
                      type="button"
                      onClick={handleFullscreen}
                      title="전체 화면으로 열기"
                    >
                      <Maximize2 size={16} />
                    </IconButton>
                    <IconButton
                      type="button"
                      onClick={onClose}
                      title="닫기"
                    >
                      <X size={18} />
                    </IconButton>
                  </HeaderRight>
                </ModalHeader>

                <MessagesScroll ref={scrollRef}>
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
                </MessagesScroll>

                <ChatInput
                  onSendMessage={sendMessage}
                  isLoading={isLoading}
                  onStopGeneration={stopGeneration}
                />
              </ChatAreaContainer>
            </ModalWrapper>
          </>
        )}
      </AnimatePresence>

      {/* 클라이언트 액션 모달들 */}
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
  background: rgba(15, 23, 42, 0.45);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  z-index: 9998;
`;

const ModalWrapper = styled(motion.div)`
  position: fixed;
  top: 5%;
  left: 50%;
  transform: translateX(-50%);
  width: 92%;
  max-width: 960px;
  height: 88vh;
  height: 88dvh;
  background: #ffffff;
  border-radius: 20px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.2);
  display: flex;
  overflow: hidden;
  z-index: 9999;
  border: 1px solid #e2e8f0;

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

const ChatAreaContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;
  overflow: hidden;
  background: radial-gradient(
    circle at 50% 10%,
    rgba(219, 234, 254, 0.45) 0%,
    rgba(248, 250, 252, 0.95) 75%
  );
`;

const ModalHeader = styled.header`
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid #e2e8f0;
  z-index: 10;
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const HeaderTitleGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const TitleText = styled.span`
  font-size: 15px;
  font-weight: 700;
  color: #0f172a;
`;

const SubtitleText = styled.span`
  font-size: 11px;
  color: #64748b;
  max-width: 220px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`;

const BetaBadge = styled.span`
  background: linear-gradient(135deg, #0958d9 0%, #7c3aed 100%);
  color: #ffffff;
  font-size: 10px;
  font-weight: 700;
  padding: 2px 5px;
  border-radius: 5px;
`;

const InuAiTag = styled.span`
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  color: #1d4ed8;
  font-size: 10px;
  font-weight: 600;
  padding: 1px 6px;
  border-radius: 5px;
  display: flex;
  align-items: center;
  gap: 3px;

  @media (max-width: 640px) {
    display: none;
  }
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const IconButton = styled.button`
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 6px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  transition: all 0.15s ease;

  &:hover {
    background: #f1f5f9;
    color: #0f172a;
  }
`;

const MessagesScroll = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px 16px 140px;
  display: flex;
  flex-direction: column;
  align-items: center;

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 6px;
  }
`;
