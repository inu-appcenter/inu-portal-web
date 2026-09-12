import React, { useState, useRef, useEffect } from "react";
import styled from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Send, X, Bot, RotateCcw } from "lucide-react";
import { postAgentChat, streamAgentChat, AgentChatResponse } from "@/apis/agent";
import AgentGenerativeCards from "./AgentGenerativeCards";
import { AgentReasoningAccordion, AgentThoughtItem } from "./AgentReasoningAccordion";
import { PortalAccountModal } from "../agent/PortalAccountModal";
import { LibraryAccountModal } from "../agent/LibraryAccountModal";
import { LmsAccountModal } from "../agent/LmsAccountModal";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  uiComponent?: AgentChatResponse["uiComponent"];
  uiComponents?: AgentChatResponse["uiComponents"];
  suggestedActions?: string[] | null;
  thoughts?: AgentThoughtItem[];
  createdAt: Date;
}

interface AgentChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SUGGESTED_PROMPTS = [
  "내 학적 정보랑 취득 학점 알려줘",
  "오늘 수업 끝나고 집 갈 때 버스 뭐 타?",
  "오늘 나 공강 시간 언제고 우주공강 있어?",
  "오늘 점심 학식이랑 날씨 알려줘",
  "장학금 공지 올라오면 알림 줘",
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
        "안녕하세요! 무엇을 도와드릴까요? 학적 정보 및 학점, 학식, 실시간 버스, 시간표, 공강 분석, 공지사항, 학사일정, 교내 연락처 등을 물어보실 수 있습니다.",
      createdAt: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [streamingStatus, setStreamingStatus] = useState<string>("");
  const [isPortalModalOpen, setIsPortalModalOpen] = useState(false);
  const [isLibraryModalOpen, setIsLibraryModalOpen] = useState(false);
  const [isLmsModalOpen, setIsLmsModalOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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

    // 최근 대화 맥락 (Multi-turn Contextual Memory)
    const recentHistory = messages
      .filter((m) => m.id !== "welcome" && !m.id.startsWith("error-") && m.content.trim().length > 0)
      .slice(-6)
      .map((m) => ({
        role: m.role,
        content: m.content,
      }));

    const assistantId = `assistant-${Date.now()}`;
    const pendingAssistantMessage: Message = {
      id: assistantId,
      role: "assistant",
      content: "",
      uiComponents: [],
      createdAt: new Date(),
    };

    setMessages((prev) => [...prev, userMessage, pendingAssistantMessage]);
    if (!textToSend) setInputValue("");
    setIsLoading(true);
    setStreamingStatus("질문 의도를 분석하고 있습니다...");

    try {
      await streamAgentChat(
        {
          message: text,
          history: recentHistory,
        },
        {
          onThought: (hop, thought, tools) => {
            setStreamingStatus("");
            setMessages((prev) =>
              prev.map((msg) => {
                if (msg.id !== assistantId) return msg;
                const existing = msg.thoughts || [];
                const alreadyExists = existing.some(
                  (t) => t.hop === hop && t.thought === thought
                );
                if (alreadyExists) return msg;
                return {
                  ...msg,
                  thoughts: [...existing, { hop, thought, tools }],
                };
              })
            );
          },
          onStatus: (_status, message) => {
            if (message) setStreamingStatus(message);
          },
          onTools: (_tools, uiComponents) => {
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === assistantId
                  ? {
                      ...msg,
                      uiComponent: uiComponents[0] || null,
                      uiComponents,
                    }
                  : msg
              )
            );
          },
          onDelta: (delta) => {
            setStreamingStatus("");
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === assistantId
                  ? {
                      ...msg,
                      content: msg.content + delta,
                    }
                  : msg
              )
            );
          },
          onDone: (suggestedActions) => {
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === assistantId
                  ? {
                      ...msg,
                      suggestedActions,
                    }
                  : msg
              )
            );
            setIsLoading(false);
            setStreamingStatus("");
          },
          onError: (err) => {
            console.error("Agent stream error:", err);
          },
        }
      );
    } catch (err: any) {
      console.warn("SSE streaming failed, falling back to sync chat:", err);
      try {
        const res = await postAgentChat({
          message: text,
          history: recentHistory,
        });

        const components =
          res.data?.uiComponents && res.data.uiComponents.length > 0
            ? res.data.uiComponents
            : res.data?.uiComponent
              ? [res.data.uiComponent]
              : [];

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantId
              ? {
                  ...msg,
                  content: res.data?.message || "",
                  uiComponent: res.data?.uiComponent,
                  uiComponents: components,
                  suggestedActions: res.data?.suggestedActions,
                }
              : msg
          )
        );
      } catch (fallbackErr: any) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantId
              ? {
                  ...msg,
                  content:
                    fallbackErr.response?.data?.message ||
                    "죄송합니다. 요청을 처리하는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
                }
              : msg
          )
        );
      }
    } finally {
      setIsLoading(false);
      setStreamingStatus("");
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
              {messages.map((msg) => {
                const hasCards =
                  (msg.uiComponents && msg.uiComponents.length > 0) || Boolean(msg.uiComponent);
                const isPending = msg.role === "assistant" && !msg.content && !hasCards;

                return (
                  <MessageRow key={msg.id} $isUser={msg.role === "user"}>
                    {msg.role === "assistant" && (
                      <AvatarCircle>
                        <Bot size={16} color="#0061ff" />
                      </AvatarCircle>
                    )}
                    <MessageBubbleGroup $isUser={msg.role === "user"}>
                      {msg.role === "assistant" && msg.thoughts && msg.thoughts.length > 0 && (
                        <AgentReasoningAccordion
                          thoughts={msg.thoughts}
                          isStreaming={isLoading && msg.id === messages[messages.length - 1]?.id}
                        />
                      )}

                      {isPending ? (
                        <LoadingBubble>
                          <Dot $delay={0} />
                          <Dot $delay={0.2} />
                          <Dot $delay={0.4} />
                          {streamingStatus && (
                            <StreamingStatusText>{streamingStatus}</StreamingStatusText>
                          )}
                        </LoadingBubble>
                      ) : (
                        Boolean(msg.content) && (
                          <Bubble $isUser={msg.role === "user"}>{msg.content}</Bubble>
                        )
                      )}

                      {hasCards && (
                        <AgentGenerativeCards
                          components={msg.uiComponents}
                          component={msg.uiComponent}
                          onNavigate={onClose}
                        />
                      )}

                      {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                        <FollowUpChipsContainer>
                          {msg.suggestedActions.map((action, aIdx) => (
                            <FollowUpChip key={aIdx} onClick={() => handleSend(action)}>
                              <span>💡</span> {action}
                            </FollowUpChip>
                          ))}
                        </FollowUpChipsContainer>
                      )}
                    </MessageBubbleGroup>
                  </MessageRow>
                );
              })}

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
          <PortalAccountModal
            isOpen={isPortalModalOpen}
            onClose={() => setIsPortalModalOpen(false)}
            onSuccess={() => handleSend("내 학적 정보랑 취득 학점 알려줘")}
          />
          <LibraryAccountModal
            isOpen={isLibraryModalOpen}
            onClose={() => setIsLibraryModalOpen(false)}
            onSuccess={() => handleSend("도서관 열람실 좌석 현황 알려줘")}
          />
          <LmsAccountModal
            isOpen={isLmsModalOpen}
            onClose={() => setIsLmsModalOpen(false)}
            onSuccess={() => handleSend("사이버캠퍼스 과제 마감 일정 알려줘")}
          />
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

const StreamingStatusText = styled.span`
  font-size: 11.5px;
  color: #8b95a1;
  font-weight: 500;
  margin-left: 6px;
`;

const FollowUpChipsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 6px;
`;

const FollowUpChip = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 11px;
  border-radius: 16px;
  background-color: #f0f7ff;
  border: 1px solid #c7e0ff;
  color: #0056e0;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background-color: #e0efff;
    border-color: #0061ff;
    transform: translateY(-1px);
  }
`;

export default AgentChatModal;
