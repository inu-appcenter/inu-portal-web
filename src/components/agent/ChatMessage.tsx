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
  RefreshCw,
  ExternalLink,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import LoadingAnimation from "@/resources/assets/illustrations/횃불이ai로딩애니메이션.gif";
import { COLORS } from "./colors";
import { UiComponent } from "@/apis/agent";
import { AgentProcessAccordion, AgentProcessStep } from "./AgentProcessAccordion";
import { GenerativeCardRenderer } from "./GenerativeCardRenderer";

export interface MessageItem {
  id: string;
  role: "user" | "ai" | "assistant";
  content: string;
  timestamp?: number | Date;
  isStreaming?: boolean;
  process?: AgentProcessStep;
  uiComponents?: UiComponent[];
  suggestedActions?: string[];
}

const MessageRow = styled.div<{ $isUser: boolean }>`
  width: 100%;
  max-width: 800px;
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

const MessageBubble = styled.div<{ $isUser: boolean; $isError?: boolean }>`
  padding: ${(props) => (props.$isUser ? "16px" : "8px 0px")};
  font-size: ${(props) => (props.$isUser ? "16px" : "15px")};
  line-height: ${(props) => (props.$isUser ? "22px" : "1.6")};
  font-weight: ${(props) => (props.$isUser ? "400" : "inherit")};
  word-break: keep-all;
  overflow-wrap: anywhere;

  background-color: ${(props) => {
    if (props.$isError) return "#fff1f0";
    return props.$isUser ? COLORS.figmaBlue : "transparent";
  }};

  color: ${(props) => {
    if (props.$isError) return "#ff4d4f";
    return props.$isUser ? "#ffffff" : COLORS.textDark;
  }};

  border: ${(props) => {
    if (props.$isError) return "1px solid #ffa39e";
    return "none";
  }};

  border-radius: ${(props) => (props.$isUser ? "8px" : "0px")};

  /* Markdown Styles */
  p {
    margin: 0 0 8px 0;
  }
  p:last-child {
    margin: 0;
  }

  h1, h2, h3, h4, h5, h6 {
    margin: 14px 0 6px 0;
    font-weight: 700;
    line-height: 1.4;
    color: inherit;
    &:first-child {
      margin-top: 0;
    }
  }
  h1 { font-size: 1.25em; }
  h2 { font-size: 1.15em; }
  h3 { font-size: 1.05em; }
  h4, h5, h6 { font-size: 1em; }

  a {
    color: ${(props) => (props.$isUser ? "#ffd700" : COLORS.inuBlue)};
    text-decoration: underline;
    font-weight: 500;
    word-break: break-all;
  }

  ul, ol {
    margin: 8px 0;
    padding-left: 22px;
  }
  li {
    margin-bottom: 4px;
  }
  li:last-child {
    margin-bottom: 0;
  }

  strong {
    font-weight: 700;
  }

  code {
    background-color: rgba(0, 0, 0, 0.05);
    padding: 2px 6px;
    border-radius: 4px;
    font-family: monospace;
    font-size: 0.9em;
  }

  pre {
    background-color: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    padding: 10px 14px;
    overflow-x: auto;
    margin: 8px 0;

    code {
      background-color: transparent;
      padding: 0;
      border-radius: 0;
      font-size: 13px;
    }
  }

  blockquote {
    margin: 8px 0;
    padding: 6px 12px;
    border-left: 3.5px solid ${COLORS.figmaBlue};
    background-color: rgba(0, 122, 255, 0.04);
    border-radius: 0 6px 6px 0;
    color: #4a5568;

    p {
      margin: 0;
    }
  }

  hr {
    border: none;
    border-top: 1px solid #e2e8f0;
    margin: 14px 0;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    margin: 10px 0;
    font-size: 13.5px;
    text-align: left;
  }

  th {
    background-color: rgba(0, 122, 255, 0.08);
    color: ${COLORS.textDark};
    font-weight: 600;
    padding: 8px 12px;
    border: 1px solid #e2e8f0;
  }

  td {
    padding: 8px 12px;
    border: 1px solid #e2e8f0;
  }

  tr:nth-child(even) td {
    background-color: rgba(0, 0, 0, 0.015);
  }

  /* KaTeX Math Styles */
  .katex-display {
    overflow-x: auto;
    overflow-y: hidden;
    padding: 8px 0;
    margin: 8px 0;
  }

  .katex {
    font-size: 1.05em;
    text-rendering: auto;
  }
`;

const MessageFooter = styled.div<{ $isUser: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 6px;
  font-size: 11px;
  color: #999999;
  flex-direction: ${(props) => (props.$isUser ? "row-reverse" : "row")};
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
  color: #999;
  display: flex;
  align-items: center;
  gap: 4px;
  border-radius: 4px;
  font-size: 11px;
  transition: all 0.2s ease;

  &:hover {
    color: ${COLORS.textDark};
    background-color: rgba(0, 0, 0, 0.05);
  }
`;

const LoadingGif = styled.img`
  width: 48px;
  height: auto;
  display: block;
  margin-top: 4px;
`;

const ChipsGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 12px 0;
`;

const ChipButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 60px;
  font-size: 13px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s ease;
  cursor: pointer;
  background-color: #ffffff;
  color: ${COLORS.figmaBlue};
  border: 1.5px solid ${COLORS.figmaBlue};
  box-shadow: 0 2px 6px rgba(0, 122, 255, 0.08);

  &:hover {
    background-color: rgba(225, 236, 255, 0.25);
    transform: translateY(-1.5px);
    box-shadow: 0 4px 12px rgba(0, 122, 255, 0.15);
  }
`;

const cleanUrl = (url: string) => {
  let end = url.length;
  while (end > 0 && /[.,!?;:\])"']/.test(url[end - 1])) end--;
  return { cleaned: url.substring(0, end), rest: url.substring(end) };
};

const ensureHttpScheme = (url: string) => {
  if (/^https?:\/\//i.test(url)) return url;
  return `https://${url}`;
};

const COMBINED_LINK_REGEX =
  /\[([^\]]*)\]\((https?:\/\/[^\s)]+)\)|(https?:\/\/[^\s가-힣\]()<>"]+)|(?<![a-zA-Z0-9@/])((?:www\.[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*(?:\/[^\s가-힣\]()<>"]*)?|[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\.(?:inu\.ac\.kr|ac\.kr|co\.kr|go\.kr|or\.kr|re\.kr|kr|com|org|net|edu|gov|io|ai|app|me|info|biz|site|xyz|dev|page|gle|gl)(?:\/[^\s가-힣\]()<>"]*)?))/g;

const preprocessMarkdown = (rawText: string): string => {
  if (!rawText) return rawText;
  let text = rawText;
  // 스트리밍 도중 잘려 들어올 수 있는 [CHIPS... 태그 완벽 제거
  text = text.replace(/\[\s*CHIPS[\s\S]*$/i, "");
  text = text.replace(/\[CHIPS:[^\]]*\]?/gi, "");
  text = text.replace(/^[ \t]*(?:[-*+]|\d+\.)?[ \t]*\[[^\]]*\]\(\s*\)[ \t]*\r?\n?/gm, "");
  text = text.replace(/\[[^\]]*\]\(\s*\)/g, "");
  text = text.replace(/(.)\n(={3,}|-{3,})(\n|$)/g, "$1\n\n$2$3");
  text = text.replace(COMBINED_LINK_REGEX, (match, label, link, nakedScheme, nakedDomain) => {
    if (link) {
      const { cleaned, rest } = cleanUrl(link);
      return `[${label}](${ensureHttpScheme(cleaned)})${rest}`;
    } else if (nakedScheme) {
      const { cleaned, rest } = cleanUrl(nakedScheme);
      return `<${cleaned}>${rest}`;
    } else if (nakedDomain) {
      const { cleaned, rest } = cleanUrl(nakedDomain);
      return `[${cleaned}](${ensureHttpScheme(cleaned)})${rest}`;
    }
    return match;
  });
  return text;
};

const markdownComponents: any = {
  table: ({ children, ...props }: any) => (
    <div style={{ overflowX: "auto", margin: "8px 0" }}>
      <table {...props}>{children}</table>
    </div>
  ),
  a: ({ children, href, ...props }: any) => {
    if (!href || !href.trim()) return null;
    return (
      <a {...props} href={href} target="_blank" rel="noopener noreferrer">
        {children} <ExternalLink size={12} style={{ display: "inline", verticalAlign: "middle" }} />
      </a>
    );
  },
};

interface ChatMessageProps {
  message: MessageItem;
  onChipClick?: (chipText: string) => void;
  onRegenerate?: () => void;
  onNavigate?: () => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  onChipClick,
  onRegenerate,
  onNavigate,
}) => {
  const isUser = message.role === "user";
  const isLoading = !isUser && message.content === "";
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<1 | -1 | null>(null);

  const formatTime = (ts?: number | Date) => {
    if (!ts) return "";
    const date = new Date(ts);
    return date.toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy", err);
    }
  };

  return (
    <MessageRow $isUser={isUser}>
      <BubbleContainer $isUser={isUser}>
        {/* 빅스비 / Gemini 스타일 실시간 도구 실행 시각화 */}
        {!isUser && message.process && (
          <AgentProcessAccordion
            process={message.process}
            isStreaming={!!message.isStreaming}
          />
        )}

        <MessageBubble $isUser={isUser}>
          {isLoading ? (
            <LoadingGif src={LoadingAnimation} alt="답변 생성 중..." />
          ) : isUser ? (
            message.content
          ) : (
            <ReactMarkdown
              remarkPlugins={[
                [remarkGfm, { singleTilde: false }],
                remarkBreaks,
                remarkMath,
              ]}
              rehypePlugins={[rehypeKatex]}
              components={markdownComponents}
            >
              {preprocessMarkdown(message.content)}
            </ReactMarkdown>
          )}
        </MessageBubble>

        {/* Generative UI 카드 (inuai 학사 지식베이스 출처 및 캠퍼스 위젯 - AI 답변 맨 끝에 표출) */}
        {!isUser && message.uiComponents && message.uiComponents.length > 0 && (
          <GenerativeCardRenderer
            uiComponents={message.uiComponents}
            onNavigate={onNavigate}
          />
        )}

        {!isLoading && (
          <MessageFooter $isUser={isUser}>
            {message.timestamp && <span>{formatTime(message.timestamp)}</span>}

            {!isUser && message.content && (
              <>
                <ActionButton onClick={handleCopy} title="답변 복사">
                  {copied ? <Check size={12} color="#52c41a" /> : <Copy size={12} />}
                  {copied ? "복사됨" : "복사"}
                </ActionButton>

                {onRegenerate && (
                  <ActionButton onClick={onRegenerate} title="다시 생성">
                    <RefreshCw size={12} /> 다시 생성
                  </ActionButton>
                )}

                <div style={{ display: "inline-flex", gap: "4px" }}>
                  <ActionButton
                    onClick={() => setFeedback((prev) => (prev === 1 ? null : 1))}
                    title="좋아요"
                    style={feedback === 1 ? { color: COLORS.figmaBlue, fontWeight: 600 } : undefined}
                  >
                    <ThumbsUp size={12} color={feedback === 1 ? COLORS.figmaBlue : undefined} />
                  </ActionButton>
                  <ActionButton
                    onClick={() => setFeedback((prev) => (prev === -1 ? null : -1))}
                    title="싫어요"
                    style={feedback === -1 ? { color: "#ff4d4f", fontWeight: 600 } : undefined}
                  >
                    <ThumbsDown size={12} color={feedback === -1 ? "#ff4d4f" : undefined} />
                  </ActionButton>
                </div>
              </>
            )}
          </MessageFooter>
        )}

        {/* 후속 추천 질문 칩 */}
        {!isUser && !message.isStreaming && message.suggestedActions && message.suggestedActions.length > 0 && (
          <ChipsGroup>
            {message.suggestedActions.map((chip, idx) => (
              <ChipButton key={idx} onClick={() => onChipClick?.(chip)}>
                {chip}
              </ChipButton>
            ))}
          </ChipsGroup>
        )}
      </BubbleContainer>
    </MessageRow>
  );
};
