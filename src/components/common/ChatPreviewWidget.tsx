import React from "react";
import { useQuery } from "@tanstack/react-query";
import styled from "styled-components";
import { getPublicChatMessages } from "@/apis/chat";
import { PublicChatMessage, GetPublicChatMessagesResponse } from "@/types/chat";

interface ChatPreviewWidgetProps {
  roomId: number;
}

const PASTEL_COLORS = [
  "#FFF4BD", // 파스텔 노랑
  "#E2F0D9", // 파스텔 초록
  "#FFD9D9", // 파스텔 빨강
  "#D9EFFF", // 파스텔 파랑
  "#EADBFF", // 파스텔 보라
  "#FFE5D0", // 파스텔 주황
];

const ChatPreviewWrapper = styled.div`
  border-radius: 12px;
  padding: 16px;
  width: 100%;
  min-height: 100px;
`;

// 인덱스에 따라 좌우 정렬을 결정하는 컨테이너
const MessageContainer = styled.div<{ isRight: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: ${(props) => (props.isRight ? "flex-end" : "flex-start")};
  margin-bottom: 12px;
  &:last-child {
    margin-bottom: 0;
  }
`;

const MessageContent = styled.div<{ isRight: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: ${(props) => (props.isRight ? "flex-end" : "flex-start")};
`;

const SenderName = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: #3a3a3c;
  margin-bottom: 4px;
`;

const MessageBubble = styled.div<{ isRight: boolean }>`
  display: flex;
  flex-direction: ${(props) => (props.isRight ? "row-reverse" : "row")};
  align-items: flex-end;
  gap: 6px;
`;

const Bubble = styled.div<{ backgroundColor: string; isRight: boolean }>`
  padding: 10px 14px;
  border-radius: ${(props) =>
    props.isRight ? "18px 2px 18px 18px" : "2px 18px 18px 18px"};
  font-size: 15px;
  line-height: 1.4;
  max-width: 240px;
  word-break: break-word;
  background-color: ${(props) => props.backgroundColor};
  color: #1c1c1e;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
`;

const TimeText = styled.span`
  font-size: 11px;
  color: #a1a1a6;
  white-space: nowrap;
`;

const InfoText = styled.div`
  font-size: 14px;
  color: #8e8e93;
  text-align: center;
  padding: 20px 0;
`;

const ChatPreviewWidget: React.FC<ChatPreviewWidgetProps> = ({ roomId }) => {
  const {
    data: response,
    isLoading,
    error,
  } = useQuery<GetPublicChatMessagesResponse, Error>({
    queryKey: ["publicChatMessages", roomId],
    queryFn: () => getPublicChatMessages(roomId),
    staleTime: 0,
    gcTime: 10 * 60 * 1000,
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

  const messages = response?.data || [];

  if (messages.length === 0) {
    return (
      <ChatPreviewWrapper>
        <InfoText>메시지가 없습니다.</InfoText>
      </ChatPreviewWrapper>
    );
  }

  const latestMessages = messages.slice(0, 2);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getPastelColor = (id: number) => {
    const index = id % PASTEL_COLORS.length;
    return PASTEL_COLORS[index];
  };

  return (
    <ChatPreviewWrapper>
      {latestMessages.map((message: PublicChatMessage, index: number) => {
        // index가 0이면 좌측, 1이면 우측 배치
        const isRight = index % 2 !== 0;

        return (
          <MessageContainer key={message.messageId} isRight={isRight}>
            <MessageContent isRight={isRight}>
              <SenderName>{message.senderNickname}</SenderName>
              <MessageBubble isRight={isRight}>
                <Bubble
                  backgroundColor={getPastelColor(message.messageId)}
                  isRight={isRight}
                >
                  {message.content === ""
                    ? "사진을 보냈습니다."
                    : message.content}
                </Bubble>
                <TimeText>{formatTime(message.createDate)}</TimeText>
              </MessageBubble>
            </MessageContent>
          </MessageContainer>
        );
      })}
    </ChatPreviewWrapper>
  );
};

export default ChatPreviewWidget;
