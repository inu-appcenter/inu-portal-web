import React from "react";
import { useQuery } from "@tanstack/react-query";
import styled from "styled-components";
import { getPublicChatMessages } from "@/apis/chat";
import { PublicChatMessage, GetPublicChatMessagesResponse } from "@/types/chat";

interface ChatPreviewWidgetProps {
  roomId: number;
}

const ChatPreviewWrapper = styled.div`
  background-color: #f4f4f4;
  border-radius: 12px;
  padding: 16px;
  //margin-bottom: 20px;
  width: 100%;
  min-height: 100px;
`;

const MessageContainer = styled.div`
  display: flex;
  margin-bottom: 12px;
  &:last-child {
    margin-bottom: 0;
  }
`;

const MessageContent = styled.div`
  display: flex;
  flex-direction: column;
`;

const SenderName = styled.span`
  font-size: 14px;
  font-weight: 500;
  color: #1c1c1e;
  margin-bottom: 4px;
`;

const MessageBubble = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 8px;
`;

const Bubble = styled.div`
  padding: 10px 14px;
  border-radius: 20px;
  font-size: 16px;
  line-height: 22px;
  max-width: 240px;
  word-break: break-word;
  background: #ffffff;
  color: #1c1c1e;
`;

const InfoText = styled.div`
  font-size: 14px;
  color: #767676;
  text-align: center;
  padding: 20px 0;
`;

const ChatPreviewWidget: React.FC<ChatPreviewWidgetProps> = ({ roomId }) => {
  const { data, isLoading, error } = useQuery<
    GetPublicChatMessagesResponse,
    Error
  >({
    queryKey: ["publicChatMessages", roomId],
    queryFn: () => getPublicChatMessages(roomId),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000, // 타이머
  });

  if (isLoading) {
    return (
      <ChatPreviewWrapper>
        <InfoText>로딩 중...</InfoText>
      </ChatPreviewWrapper>
    );
  }

  if (error) {
    return (
      <ChatPreviewWrapper>
        <InfoText>오류 발생: {error.message}</InfoText>
      </ChatPreviewWrapper>
    );
  }

  if (!data || data.length === 0) {
    return (
      <ChatPreviewWrapper>
        <InfoText>메시지가 없습니다.</InfoText>
      </ChatPreviewWrapper>
    );
  }

  // 타입 명시
  const messages: PublicChatMessage[] = Array.isArray(data) ? data : [];
  const latestMessages = messages.slice(0, 2);

  return (
    <ChatPreviewWrapper>
      {latestMessages.map((message: PublicChatMessage) => (
        <MessageContainer key={message.messageId}>
          <MessageContent>
            <SenderName>{message.senderNickname}</SenderName>
            <MessageBubble>
              <Bubble>{message.content}</Bubble>
            </MessageBubble>
          </MessageContent>
        </MessageContainer>
      ))}
    </ChatPreviewWrapper>
  );
};

export default ChatPreviewWidget;
