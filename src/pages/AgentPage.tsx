import { useRef, useEffect } from "react";
import { useAgentChat } from "@/hooks/useAgentChat";
import { Sidebar } from "@/components/agent/Sidebar";
import { ChatHeader } from "@/components/agent/ChatHeader";
import { ChatMessage } from "@/components/agent/ChatMessage";
import { ChatInput } from "@/components/agent/ChatInput";
import { GuideScreen } from "@/components/agent/GuideScreen";
import {
  AppContainer,
  Overlay,
  MainArea,
  AmbientOrb,
  ChatArea,
} from "@/components/agent/AppLayout";
import ellipse2 from "@/resources/assets/illustrations/ellipse2.svg";

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

  const chatAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatAreaRef.current) {
      chatAreaRef.current.scrollTo({
        top: chatAreaRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [currentRoom.messages.length]);

  const handleSelectRoom = (id: string) => {
    setCurrentRoomId(id);
    if (window.innerWidth <= 768) setIsSidebarOpen(false);
  };

  const handleNewChat = () => {
    createNewRoom();
    if (window.innerWidth <= 768) setIsSidebarOpen(false);
  };

  return (
    <AppContainer>
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
        <AmbientOrb src={ellipse2} alt="" />

        <ChatHeader
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
          onNewChat={handleNewChat}
        />

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

        <ChatInput
          onSendMessage={sendMessage}
          isLoading={isLoading}
          onStopGeneration={stopGeneration}
        />
      </MainArea>
    </AppContainer>
  );
}
