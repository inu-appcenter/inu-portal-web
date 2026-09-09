import React, { useState, useRef, useEffect } from "react";
import styled from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Send, X, Bot, RotateCcw } from "lucide-react";
import { postAgentChat, AgentChatResponse } from "@/apis/agent";
import AgentGenerativeCards from "./AgentGenerativeCards";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  uiComponent?: AgentChatResponse["uiComponent"];
  uiComponents?: AgentChatResponse["uiComponents"];
  createdAt: Date;
}

interface AgentChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SUGGESTED_PROMPTS = [
  "오늘 점심 학식이랑 날씨 알려줘",
  "오늘 수업 뭐 있고 정문 버스 언제 와?",
  "장학금 공지 올라오면 알림 줘",
  "채팅 알림 꺼줘",
  "내 알림 설정 확인해줘",
  "이번 달 학사일정 알려줘",
];

export const AgentChatModal: React.FC<AgentChatModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "안녕하세요! 무엇을 도와드릴까요? 학식, 실시간 버스, 시간표, 공지사항, 학사일정, 교내 연락처 등을 물어보실 수 있습니다.",
      createdAt: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
        scrollToBottom();
      }, 200);
    }
  }, [isOpen, messages]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend ?? inputValue).trim();
    if (!text || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text,
      createdAt: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!textToSend) setInputValue("");
    setIsLoading(true);

    try {
      const res = await postAgentChat({
        message: text,
      });

      const components =
        res.data?.uiComponents && res.data.uiComponents.length > 0
          ? res.data.uiComponents
          : res.data?.uiComponent
            ? [res.data.uiComponent]
            : [];

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: res.data?.message || "",
        uiComponent: res.data?.uiComponent,
        uiComponents: components,
        createdAt: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: "assistant",
        content:
          err.response?.data?.message ||
          "죄송합니다. 요청을 처리하는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
        createdAt: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content:
          "안녕하세요! 무엇을 도와드릴까요? 학식, 실시간 버스, 시간표, 공지사항, 학사일정, 교내 연락처 등을 물어보실 수 있습니다.",
        createdAt: new Date(),
      },
    ]);
    setInputValue("");
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <Backdrop
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <ModalContainer
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 450, damping: 35 }}
          >
            {/* Header */}
            <Header>
              <HeaderLeft>
                <SparkleIconBox>
                  <Sparkles size={18} color="#0061ff" />
                </SparkleIconBox>
                <HeaderTextGroup>
                  <HeaderTitleRow>
                    <HeaderTitle>인팁 캠퍼스 비서</HeaderTitle>
                    <AiBadge>AI</AiBadge>
                  </HeaderTitleRow>
                  <HeaderSubtitle>Gemma 4 기반 생성형 포털 에이전트</HeaderSubtitle>
                </HeaderTextGroup>
              </HeaderLeft>
              <HeaderRight>
                <IconButton
                  type="button"
                  onClick={handleResetChat}
                  title="대화 내용 초기화"
                  aria-label="대화 내용 초기화"
                >
                  <RotateCcw size={17} />
                </IconButton>
                <IconButton
                  type="button"
                  onClick={onClose}
                  title="닫기"
                  aria-label="닫기"
                >
                  <X size={20} />
                </IconButton>
              </HeaderRight>
            </Header>

            {/* Message Area */}
            <MessagesContainer>
              {messages.map((msg) => (
                <MessageRow key={msg.id} $isUser={msg.role === "user"}>
                  {msg.role === "assistant" && (
                    <AvatarCircle>
                      <Bot size={16} color="#0061ff" />
                    </AvatarCircle>
                  )}
                  <MessageBubbleGroup $isUser={msg.role === "user"}>
                    <Bubble $isUser={msg.role === "user"}>{msg.content}</Bubble>
                    {((msg.uiComponents && msg.uiComponents.length > 0) || msg.uiComponent) && (
                      <AgentGenerativeCards
                        components={msg.uiComponents}
                        component={msg.uiComponent}
                        onNavigate={onClose}
                      />
                    )}
                  </MessageBubbleGroup>
                </MessageRow>
              ))}

              {isLoading && (
                <MessageRow $isUser={false}>
                  <AvatarCircle>
                    <Bot size={16} color="#0061ff" />
                  </AvatarCircle>
                  <LoadingBubble>
                    <Dot $delay={0} />
                    <Dot $delay={0.2} />
                    <Dot $delay={0.4} />
                  </LoadingBubble>
                </MessageRow>
              )}

              {/* Suggestions */}
              {messages.length === 1 && !isLoading && (
                <SuggestionsWrapper>
                  <SuggestionsLabel>추천 질문</SuggestionsLabel>
                  <ChipGrid>
                    {SUGGESTED_PROMPTS.map((prompt, idx) => (
                      <Chip key={idx} onClick={() => handleSend(prompt)}>
                        {prompt}
                      </Chip>
                    ))}
                  </ChipGrid>
                </SuggestionsWrapper>
              )}

              <div ref={messagesEndRef} />
            </MessagesContainer>

            {/* Input Bar */}
            <InputContainer>
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="궁금한 내용을 물어보세요..."
                disabled={isLoading}
              />
              <SendButton
                type="button"
                onClick={() => handleSend()}
                disabled={!inputValue.trim() || isLoading}
              >
                <Send size={16} />
              </SendButton>
            </InputContainer>
          </ModalContainer>
        </>
      )}
    </AnimatePresence>
  );
};

/* --- Styled Components --- */
const Backdrop = styled(motion.div)`
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.25);
  z-index: 1001;
`;

const ModalContainer = styled(motion.div)`
  position: fixed;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  z-index: 1003;
  border-radius: 28px;
  overflow: hidden;
  box-shadow:
    0 25px 50px -12px rgba(0, 0, 0, 0.35),
    0 10px 15px -3px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(0, 0, 0, 0.08);

  /* Mobile */
  top: 20px;
  bottom: 20px;
  left: 12px;
  right: 12px;

  /* Tablet & Desktop */
  @media (min-width: 451px) {
    top: auto;
    left: auto;
    width: 400px;
    height: 640px;
    bottom: 90px;
    right: 20px;
    max-height: calc(100dvh - 170px);
  }

  @media (min-width: 1024px) {
    right: calc(50% - 600px + 20px + 75px);
    bottom: 90px;
    height: 640px;
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 18px;
  border-bottom: 1px solid #f2f4f6;
  background: #ffffff;
  flex-shrink: 0;
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const SparkleIconBox = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 12px;
  background-color: #eff6ff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const HeaderTextGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const HeaderTitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const HeaderTitle = styled.span`
  font-size: 15px;
  font-weight: 700;
  color: #191f28;
`;

const AiBadge = styled.span`
  font-size: 10px;
  font-weight: 700;
  color: #0061ff;
  background-color: #eff6ff;
  border: 1px solid #d3e5ff;
  padding: 1px 5px;
  border-radius: 6px;
`;

const HeaderSubtitle = styled.span`
  font-size: 11px;
  color: #8b95a1;
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const IconButton = styled.button`
  background: none;
  border: none;
  color: #8b95a1;
  cursor: pointer;
  padding: 6px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition:
    background-color 0.15s ease,
    color 0.15s ease;

  &:hover {
    background-color: #f2f4f6;
    color: #191f28;
  }
`;

const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  background-color: #f9fafb;
`;

const MessageRow = styled.div<{ $isUser: boolean }>`
  display: flex;
  gap: 8px;
  justify-content: ${({ $isUser }) => ($isUser ? "flex-end" : "flex-start")};
  align-items: flex-start;
`;

const AvatarCircle = styled.div`
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background-color: #e5efff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const MessageBubbleGroup = styled.div<{ $isUser: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: ${({ $isUser }) => ($isUser ? "flex-end" : "flex-start")};
  max-width: 85%;
`;

const Bubble = styled.div<{ $isUser: boolean }>`
  padding: 10px 14px;
  border-radius: ${({ $isUser }) =>
    $isUser ? "18px 18px 4px 18px" : "18px 18px 18px 4px"};
  background-color: ${({ $isUser }) => ($isUser ? "#0061ff" : "#ffffff")};
  color: ${({ $isUser }) => ($isUser ? "#ffffff" : "#191f28")};
  font-size: 13.5px;
  line-height: 1.5;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border: ${({ $isUser }) => ($isUser ? "none" : "1px solid #edf0f2")};
  white-space: pre-wrap;
  word-break: break-word;
`;

const LoadingBubble = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 12px 16px;
  border-radius: 18px 18px 18px 4px;
  background-color: #ffffff;
  border: 1px solid #edf0f2;
`;

const Dot = styled.span<{ $delay: number }>`
  width: 6px;
  height: 6px;
  background-color: #8b95a1;
  border-radius: 50%;
  animation: pulse 1s infinite ease-in-out;
  animation-delay: ${({ $delay }) => $delay}s;

  @keyframes pulse {
    0%,
    100% {
      opacity: 0.3;
      transform: scale(0.8);
    }
    50% {
      opacity: 1;
      transform: scale(1.1);
    }
  }
`;

const SuggestionsWrapper = styled.div`
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const SuggestionsLabel = styled.span`
  font-size: 12px;
  font-weight: 600;
  color: #8b95a1;
`;

const ChipGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`;

const Chip = styled.button`
  padding: 7px 12px;
  border-radius: 20px;
  background-color: #ffffff;
  border: 1px solid #e5e8eb;
  color: #333d4b;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background-color: #eff6ff;
    border-color: #0061ff;
    color: #0061ff;
  }
`;

const InputContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 14px;
  background-color: #ffffff;
  border-top: 1px solid #f2f4f6;
`;

const Input = styled.input`
  flex: 1;
  padding: 10px 14px;
  border-radius: 24px;
  border: 1px solid #e5e8eb;
  background-color: #f9fafb;
  font-size: 14px;
  outline: none;
  transition: border-color 0.15s ease;

  &:focus {
    border-color: #0061ff;
    background-color: #ffffff;
  }

  &::placeholder {
    color: #adb5bd;
  }
`;

const SendButton = styled.button`
  width: 38px;
  height: 38px;
  border-radius: 50%;
  border: none;
  background-color: #0061ff;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  transition:
    background-color 0.15s ease,
    opacity 0.15s ease;

  &:disabled {
    background-color: #cbd5e1;
    cursor: not-allowed;
  }

  &:not(:disabled):hover {
    background-color: #0052d9;
  }
`;

export default AgentChatModal;
