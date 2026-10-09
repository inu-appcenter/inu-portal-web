import styled, { keyframes } from "styled-components";
import { Loader2 } from "lucide-react";
import Icon from "@/components/common/Icon";
import { torchAiLogo as TorchAiLogo } from "@/resources/assets/illustrations/ai";
import ChatMessageContent from "./ChatMessageContent";
import { ChatMessage } from "@/types/chat";
import useAIChatStore from "@/stores/useAIChatStore";

interface ChatItemBotProps {
  message: ChatMessage;
  showTime?: boolean;
  isLoading?: boolean;
  onAskHere?: () => void;
}

export default function ChatItemBot({
  message,
  showTime = true,
  isLoading = false,
  onAskHere,
}: ChatItemBotProps) {
  const { toggleChat } = useAIChatStore();

  const time = message.createDate
    ? new Date(message.createDate).toLocaleTimeString("ko-KR", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  const handleOpenAIChat = () => {
    toggleChat();
  };

  return (
    <BotContainer>
      <BotProfileImage
        src={TorchAiLogo}
        alt="챗불이"
        onClick={handleOpenAIChat}
      />

      <BotMessageArea>
        <BotHeader>
          <BotTitleWrapper onClick={handleOpenAIChat}>
            <BotTitle>챗불이</BotTitle>
            <BotBadge>AI</BotBadge>
          </BotTitleWrapper>
          <BotSubtitle>인천대학교 학사 도우미</BotSubtitle>
        </BotHeader>

        <BotCardWrapper>
          <BotCardContent>
            {isLoading ? (
              <LoadingState>
                <SpinLoader size={18} color="rgb(255, 107, 0)" />
                <LoadingText>챗불이가 답변을 생각하고 있어요...</LoadingText>
              </LoadingState>
            ) : (
              <ChatMessageContent content={message.content} />
            )}

            {!isLoading && (
              <>
                <ActionButtonsWrapper>
                  <ActionButton onClick={handleOpenAIChat}>
                    <img src={TorchAiLogo} alt="" width={22} height={22} />
                    <span>챗불이로 이동</span>
                  </ActionButton>
                  {onAskHere && (
                    <ActionButton onClick={onAskHere}>
                      <Icon name="chat" size={16} color="var(--gray-600)" />
                      <span>여기서 질문</span>
                    </ActionButton>
                  )}
                </ActionButtonsWrapper>

                <Disclaimer>
                  챗불이는 AI이며, 인천대학교의 공식 답변이 아니에요.
                  <br />
                  실수할 수 있으니, 중요한 정보는 직접 확인하세요.
                </Disclaimer>
              </>
            )}
          </BotCardContent>

          {showTime && time && !isLoading && <TimeLabel>{time}</TimeLabel>}
        </BotCardWrapper>
      </BotMessageArea>
    </BotContainer>
  );
}

const BotContainer = styled.div`
  display: flex;
  align-self: flex-start;
  margin-right: auto;
  margin-bottom: 12px;
  align-items: flex-start;
  max-width: 95%;

  @media (min-width: 768px) {
    margin-bottom: 16px;
    max-width: 80%;
  }
`;

const BotProfileImage = styled.img`
  width: 38px;
  height: 38px;
  border-radius: 50%;
  margin-right: 10px;
  cursor: pointer;
  object-fit: contain;
  background-color: var(--bg-error);
  border: 1px solid rgb(255, 229, 211);
  padding: 2px;
  flex-shrink: 0;
  box-shadow: 0 2px 6px rgba(255, 107, 0, 0.12);
  transition: transform 0.15s ease;

  &:active {
    transform: scale(0.95);
  }
`;

const BotMessageArea = styled.div`
  display: flex;
  flex-direction: column;
  max-width: 100%;
  flex: 1;
`;

const BotHeader = styled.div`
  display: flex;
  align-items: baseline;
  gap: 6px;
  margin-bottom: 5px;
`;

const BotTitleWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
`;

const BotTitle = styled.span`
  font-size: 14px;
  font-weight: 700;
  color: var(--text-primary);
`;

const BotBadge = styled.span`
  font-size: 10px;
  font-weight: 700;
  color: rgb(255, 107, 0);
  background-color: rgb(255, 240, 230);
  border: 1px solid rgb(255, 216, 191);
  padding: 1px 5px;
  border-radius: 6px;
  line-height: 1.2;
`;

const BotSubtitle = styled.span`
  font-size: 11px;
  font-weight: 500;
  color: var(--text-tertiary);
`;

const BotCardWrapper = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 8px;
  max-width: 100%;
  width: 100%;
`;

const BotCardContent = styled.div`
  background: var(--bg-base);
  border: 1px solid var(--border-default);
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.05);
  border-radius: 4px 18px 18px 18px;
  padding: 10px 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
  min-width: 250px;
  box-sizing: border-box;
`;

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const SpinLoader = styled(Loader2)`
  animation: ${spin} 1s linear infinite;
  flex-shrink: 0;
`;

const LoadingState = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 0;
`;

const LoadingText = styled.span`
  font-size: 14px;
  color: var(--gray-700);
  font-weight: 500;
`;

const ActionButtonsWrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
  gap: 6px;
  width: 100%;
  padding-top: 6px;
  border-top: 1px solid var(--border-default);
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  background: var(--bg-subtle);
  border: 1px solid var(--border-default);
  border-radius: 10px;
  padding: 7px 10px;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
  cursor: pointer;
  word-break: keep-all;
  white-space: normal;
  text-align: center;
  width: 100%;
  box-sizing: border-box;
  transition: all 0.15s ease;

  img {
    border-radius: 50%;
    object-fit: contain;
    flex-shrink: 0;
  }

  &:hover {
    background: var(--bg-muted);
    border-color: var(--border-strong);
  }

  &:active {
    transform: scale(0.97);
  }
`;

const Disclaimer = styled.div`
  font-size: 10px;
  line-height: 1.4;
  color: var(--text-tertiary);
  //background: var(--bg-subtle);
  border-radius: 8px;
  padding: 6px 8px;
`;

const TimeLabel = styled.span`
  font-size: 11px;
  color: var(--gray-600);
  white-space: nowrap;
  flex-shrink: 0;
`;
