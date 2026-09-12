import React, { useState } from "react";
import styled from "styled-components";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import {
  Copy,
  Check,
  ThumbsUp,
  ThumbsDown,
  Sparkles,
} from "lucide-react";
import loadingGif from "@/resources/assets/illustrations/횃불이ai로딩애니메이션.gif";
import { UiComponent } from "@/apis/agent";
import { AgentProcessAccordion, AgentProcessStep } from "./AgentProcessAccordion";
import { GenerativeCardRenderer } from "./GenerativeCardRenderer";

export interface MessageItem {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp?: number;
  isStreaming?: boolean;
  process?: AgentProcessStep;
  uiComponents?: UiComponent[];
  suggestedActions?: string[];
}

const MessageRow = styled.div<{ $isUser: boolean }>`
  width: 100%;
  max-width: 820px;
  display: flex;
  justify-content: ${(props) => (props.$isUser ? "flex-end" : "flex-start")};
  margin-bottom: 24px;
  gap: 12px;
`;

const BubbleContainer = styled.div<{ $isUser: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: ${(props) => (props.$isUser ? "flex-end" : "flex-start")};
  max-width: ${(props) => (props.$isUser ? "80%" : "100%")};
  width: ${(props) => (props.$isUser ? "auto" : "100%")};
`;

const MessageBubble = styled.div<{ $isUser: boolean }>`
  padding: ${(props) => (props.$isUser ? "12px 18px" : "6px 0px")};
  font-size: 15px;
  line-height: 1.65;
  word-break: keep-all;
  overflow-wrap: anywhere;

  background-color: ${(props) => (props.$isUser ? "#0958d9" : "transparent")};
  color: ${(props) => (props.$isUser ? "#ffffff" : "#111827")};
  border-radius: ${(props) => (props.$isUser ? "14px" : "0px")};
  border-bottom-right-radius: ${(props) => (props.$isUser ? "4px" : "0px")};

  /* Markdown Styles */
  p {
    margin: 0 0 10px 0;
  }
  p:last-child {
    margin: 0;
  }

  h1, h2, h3, h4 {
    margin: 14px 0 6px 0;
    font-weight: 700;
  }
  h1 { font-size: 1.25em; }
  h2 { font-size: 1.15em; }
  h3 { font-size: 1.05em; }

  ul, ol {
    margin: 8px 0;
    padding-left: 20px;
  }
  li {
    margin-bottom: 4px;
  }

  table {
    border-collapse: collapse;
    width: 100%;
    margin: 12px 0;
    font-size: 13px;
  }
  th, td {
    border: 1px solid #e2e8f0;
    padding: 8px 12px;
    text-align: left;
  }
  th {
    background-color: #f8fafc;
    font-weight: 600;
  }

  code {
    background: #f1f5f9;
    color: #0f172a;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 0.9em;
  }
  pre {
    background: #0f172a;
    color: #f8fafc;
    padding: 12px;
    border-radius: 8px;
    overflow-x: auto;
    code {
      background: transparent;
      color: inherit;
      padding: 0;
    }
  }

  blockquote {
    border-left: 3px solid #0958d9;
    margin: 8px 0;
    padding: 4px 12px;
    color: #475569;
    background: #f8fafc;
    border-radius: 0 6px 6px 0;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 0;
  color: #64748b;
  font-size: 14px;
`;

const LoadingImg = styled.img`
  width: 32px;
  height: 32px;
  object-fit: contain;
`;

const ActionToolbar = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
  color: #94a3b8;
`;

const ActionIconButton = styled.button<{ $active?: boolean }>`
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 4px 6px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: ${(props) => (props.$active ? "#0958d9" : "#64748b")};
  transition: all 0.15s ease;

  &:hover {
    background: #f1f5f9;
    color: #0f172a;
  }
`;

const ChipsGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 10px;
`;

const ChipButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 6px 12px;
  border-radius: 20px;
  background: #f0f7ff;
  border: 1px solid #bae0ff;
  color: #0958d9;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background: #0958d9;
    color: #ffffff;
    border-color: #0958d9;
  }
`;

interface ChatMessageProps {
  message: MessageItem;
  onChipClick?: (chipText: string) => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, onChipClick }) => {
  const isUser = message.role === "user";
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<"like" | "dislike" | null>(null);

  const handleCopy = () => {
    if (!message.content) return;
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <MessageRow $isUser={isUser}>
      <BubbleContainer $isUser={isUser}>
        {/* AI 메시지 상단: 실시간 Tool 및 추론 과정 시각화 (빅스비 / Gemini 스타일) */}
        {!isUser && message.process && (
          <AgentProcessAccordion
            process={message.process}
            isStreaming={!!message.isStreaming}
          />
        )}

        {/* AI 메시지: Generative UI 카드 렌더링 */}
        {!isUser && message.uiComponents && message.uiComponents.length > 0 && (
          <GenerativeCardRenderer uiComponents={message.uiComponents} />
        )}

        {/* 본문 텍스트 렌더링 */}
        <MessageBubble $isUser={isUser}>
          {isUser ? (
            message.content
          ) : message.content ? (
            <ReactMarkdown
              remarkPlugins={[remarkGfm, remarkBreaks, remarkMath]}
              rehypePlugins={[rehypeKatex]}
            >
              {message.content}
            </ReactMarkdown>
          ) : message.isStreaming ? (
            <LoadingContainer>
              <LoadingImg src={loadingGif} alt="횃불이 AI 생각 중" />
              <span>캠퍼스 비서가 답변을 작성하고 있습니다...</span>
            </LoadingContainer>
          ) : null}
        </MessageBubble>

        {/* AI 메시지 하단: 액션 툴바 (복사 / 피드백) */}
        {!isUser && !message.isStreaming && message.content && (
          <ActionToolbar>
            <ActionIconButton onClick={handleCopy}>
              {copied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
              <span>{copied ? "복사됨" : "복사"}</span>
            </ActionIconButton>
            <ActionIconButton
              $active={feedback === "like"}
              onClick={() => setFeedback((prev) => (prev === "like" ? null : "like"))}
            >
              <ThumbsUp size={14} />
            </ActionIconButton>
            <ActionIconButton
              $active={feedback === "dislike"}
              onClick={() => setFeedback((prev) => (prev === "dislike" ? null : "dislike"))}
            >
              <ThumbsDown size={14} />
            </ActionIconButton>
          </ActionToolbar>
        )}

        {/* 후속 추천 질문 칩 */}
        {!isUser && !message.isStreaming && message.suggestedActions && message.suggestedActions.length > 0 && (
          <ChipsGroup>
            {message.suggestedActions.map((chip, idx) => (
              <ChipButton key={idx} onClick={() => onChipClick?.(chip)}>
                <Sparkles size={12} />
                {chip}
              </ChipButton>
            ))}
          </ChipsGroup>
        )}
      </BubbleContainer>
    </MessageRow>
  );
};
