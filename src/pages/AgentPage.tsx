import { useRef, useEffect } from "react";
import styled from "styled-components";
import { useAgentChat } from "@/hooks/useAgentChat";
import { Sidebar } from "@/components/agent/Sidebar";
import { ChatHeader } from "@/components/agent/ChatHeader";
import { ChatMessage } from "@/components/agent/ChatMessage";
import { ChatInput } from "@/components/agent/ChatInput";
import { GuideScreen } from "@/components/agent/GuideScreen";

const PageContainer = styled.div`
  display: flex;
  width: 100%;
  height: 100vh;
  height: 100dvh;
  position: relative;
  overflow: hidden;
  background-color: #f8fafc;
  font-family: -apple-system, BlinkMacSystemFont, "Pretendard", Roboto, sans-serif;
`;

const MainArea = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;
  overflow: hidden;
  background: radial-gradient(
    circle at 50% 15%,
    rgba(219, 234, 254, 0.45) 0%,
    rgba(248, 250, 252, 0.95) 70%
  );
`;

const ChatScrollArea = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px 16px 140px;
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

const Overlay = styled.div<{ $isOpen: boolean }>`
  display: none;
  @media (max-width: 768px) {
    display: ${(props) => (props.$isOpen ? "block" : "none")};
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.35);
    z-index: 40;
    backdrop-filter: blur(4px);
  }
`;

export default function AgentPage() {
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

  const scrollRef = useRef<HTMLDivElement>(null);

  // 새 메시지가 오면 하단 스크롤
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [currentRoom.messages, currentRoom.messages[currentRoom.messages.length - 1]?.content]);

  const handleSelectRoom = (id: string) => {
    setCurrentRoomId(id);
    if (window.innerWidth <= 768) setIsSidebarOpen(false);
  };

  const handleNewChat = () => {
    createNewRoom();
    if (window.innerWidth <= 768) setIsSidebarOpen(false);
  };

  return (
    <PageContainer>
      <Overlay $isOpen={isSidebarOpen} onClick={() => setIsSidebarOpen(false)} />

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

      <MainArea>
        <ChatHeader
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
          onNewChat={handleNewChat}
        />

        <ChatScrollArea ref={scrollRef}>
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
        </ChatScrollArea>

        <ChatInput
          onSendMessage={sendMessage}
          isLoading={isLoading}
          onStopGeneration={stopGeneration}
        />
      </MainArea>
    </PageContainer>
  );
}
