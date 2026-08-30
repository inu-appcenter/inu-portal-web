import React from "react";
import styled from "styled-components";
import { Sparkles, ExternalLink } from "lucide-react";

interface ChatMessageContentProps {
  content: string;
}

export default function ChatMessageContent({ content }: ChatMessageContentProps) {
  // 본문에서 [CHATBULI_ANSWER] 식별 태그, \n 이스케이프 문자열 및 접두사 정돈
  const cleanedContent = React.useMemo(() => {
    if (!content) return "";
    let text = String(content);

    // 1. JSON 직렬화나 API 응답에서 전달된 리터럴 \n, \r\n, \r 문자열을 실제 개행 문자로 치환
    text = text
      .replace(/\\r\\n/g, "\n")
      .replace(/\\n/g, "\n")
      .replace(/\\r/g, "\n")
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n");

    // 2. 레거시 태그 및 접두사 제거
    text = text.replace(/\[CHATBULI_ANSWER\]/g, "");
    text = text.replace(/^\[챗불이 답변\]\s*/g, "");

    // 3. 개행 없이 이어진 마크다운 구조(헤더, 구분선, 출처, 연속 링크 등) 방어적 개행 보정
    text = text.replace(/([^\n])(#{1,6}\s+)/g, "$1\n\n$2");
    text = text.replace(/([^\n])(---)/g, "$1\n\n$2");
    text = text.replace(/(---)([^\n])/g, "$1\n\n$2");
    text = text.replace(/([^\n])(\[출처\])/g, "$1\n\n$2");
    text = text.replace(/(\[출처\])([^\n])/g, "$1\n$2");
    text = text.replace(/(\]\(https?:\/\/[^\s)]+\))(?=\[)/g, "$1\n");

    return text.trim();
  }, [content]);

  // 인라인 마크다운 (마크다운 링크 [text](url), 일반 URL, 볼드 **, 코드 `, 기울임 *, 취소선 ~~) 파싱
  const renderInlineMarkdown = (text: string) => {
    if (!text) return null;

    // 1단계: 마크다운 링크 [링크텍스트](URL) 및 일반 URL 분리 파싱
    const linkRegex = /(\[[^\]]+\]\(https?:\/\/[^\s)]+\)|https?:\/\/[^\s]+)/g;
    const tokens = text.split(linkRegex);

    return tokens.map((token, tIdx) => {
      // 마크다운 링크인 경우: [텍스트](URL)
      const mdLinkMatch = token.match(/^\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)$/);
      if (mdLinkMatch) {
        const linkText = mdLinkMatch[1];
        const linkUrl = mdLinkMatch[2];
        return (
          <LinkTag
            key={`md-link-${tIdx}`}
            href={linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
          >
            <span>{linkText}</span>
            <ExternalLink size={11} />
          </LinkTag>
        );
      }

      // 일반 URL인 경우
      if (/^https?:\/\/[^\s]+$/.test(token)) {
        return (
          <LinkTag
            key={`raw-url-${tIdx}`}
            href={token}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
          >
            <span>[바로가기]</span>
            <ExternalLink size={11} />
          </LinkTag>
        );
      }

      // 2단계: 볼드(***, **), 인라인 코드(`), 이탤릭(*), 취소선(~~) 파싱
      const inlinePattern =
        /(\*\*\*[^*]+?\*\*\*|\*\*[^*]+?\*\*|`[^`]+?`|~~[^~]+?~~|\*[^*]+?\*)/g;
      const parts = token.split(inlinePattern);

      return parts.map((part, pIdx) => {
        if (part.startsWith("***") && part.endsWith("***") && part.length >= 6) {
          return (
            <BoldText key={`bi-${pIdx}`}>
              <em>{part.slice(3, -3)}</em>
            </BoldText>
          );
        }
        if (part.startsWith("**") && part.endsWith("**") && part.length >= 4) {
          return <BoldText key={`b-${pIdx}`}>{part.slice(2, -2)}</BoldText>;
        }
        if (part.startsWith("`") && part.endsWith("`") && part.length >= 2) {
          return (
            <HighlightBadge key={`c-${pIdx}`}>
              {part.slice(1, -1)}
            </HighlightBadge>
          );
        }
        if (part.startsWith("~~") && part.endsWith("~~") && part.length >= 4) {
          return <del key={`del-${pIdx}`}>{part.slice(2, -2)}</del>;
        }
        if (
          part.startsWith("*") &&
          part.endsWith("*") &&
          part.length >= 2 &&
          !part.startsWith("**")
        ) {
          return <em key={`i-${pIdx}`}>{part.slice(1, -1)}</em>;
        }
        return part;
      });
    });
  };

  const lines = cleanedContent.split("\n");

  return (
    <ContentContainer>
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return <div key={idx} style={{ height: "6px" }} />;
        }

        // 0. 수평 구분선 (***, ---, ___)
        if (/^(\*{3,}|-{3,}|_{3,})$/.test(trimmed)) {
          return <HorizontalDivider key={idx} />;
        }

        // 1. 인용구 (> ...)
        if (/^>\s*/.test(trimmed)) {
          const quoteText = trimmed.replace(/^>\s*/, "");
          return (
            <BlockQuote key={idx}>
              {renderInlineMarkdown(quoteText)}
            </BlockQuote>
          );
        }

        // 2. 헤더 (#, ##, ###, #### 등)
        const headerMatch = trimmed.match(/^#{1,6}\s*(.+)$/);
        if (headerMatch) {
          const headerLevel = (trimmed.match(/^#{1,6}/)?.[0] || "#").length;
          const headerText = headerMatch[1].trim();
          return (
            <SectionHeader key={idx} $level={headerLevel}>
              <Sparkles size={headerLevel <= 2 ? 14 : 12} color="#FF6B00" />
              <span>{renderInlineMarkdown(headerText)}</span>
            </SectionHeader>
          );
        }

        // 3. 번호 목록 (1. , 2. , 1) 등)
        const numberedMatch = trimmed.match(/^(\d+[\.)])\s+(.+)$/);
        if (numberedMatch) {
          const numberPrefix = numberedMatch[1];
          const listText = numberedMatch[2];
          return (
            <NumberedItem key={idx}>
              <NumberLabel>{numberPrefix}</NumberLabel>
              <div className="list-text">
                {renderInlineMarkdown(listText)}
              </div>
            </NumberedItem>
          );
        }

        // 4. 불릿 목록 (-, *, •, +)
        if (/^[-*•+]\s+/.test(trimmed)) {
          const bulletText = trimmed.replace(/^[-*•+]\s+/, "");
          return (
            <BulletItem key={idx}>
              <BulletDot />
              <div className="list-text">
                {renderInlineMarkdown(bulletText)}
              </div>
            </BulletItem>
          );
        }

        // 5. 일반 문단
        return (
          <Paragraph key={idx}>
            {renderInlineMarkdown(line)}
          </Paragraph>
        );
      })}
    </ContentContainer>
  );
}

const ContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  color: #1c1c1e;
  font-size: 15px;
  line-height: 1.6;
  word-break: break-word;
  user-select: text;
  -webkit-user-select: text;
`;

const Paragraph = styled.p`
  margin: 0;
  white-space: pre-wrap;
`;

const SectionHeader = styled.div<{ $level?: number }>`
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 700;
  font-size: ${(props) => (props.$level === 1 ? "16px" : props.$level === 2 ? "15.5px" : "15px")};
  color: #1c1c1e;
  margin-top: ${(props) => (props.$level && props.$level <= 2 ? "10px" : "6px")};
  margin-bottom: 2px;

  svg {
    flex-shrink: 0;
  }
`;

const BlockQuote = styled.div`
  border-left: 3px solid #5e92f0;
  padding-left: 10px;
  margin: 4px 0;
  color: #555555;
  font-style: italic;
  background: #f8faff;
  padding-top: 4px;
  padding-bottom: 4px;
  border-radius: 0 4px 4px 0;
`;

const NumberedItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 6px;
  margin: 1px 0;

  .list-text {
    flex: 1;
    min-width: 0;
  }
`;

const NumberLabel = styled.span`
  font-weight: 700;
  color: #5e92f0;
  flex-shrink: 0;
  line-height: 1.55;
`;

const BulletItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin: 1px 0;

  .list-text {
    flex: 1;
    min-width: 0;
  }
`;

const BulletDot = styled.div`
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background-color: #5e92f0;
  margin-top: 9px;
  flex-shrink: 0;
`;

const BoldText = styled.strong`
  font-weight: 700;
  color: #111111;
`;

const HighlightBadge = styled.code`
  background: #f0f4ff;
  color: #3b6cd4;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: inherit;
  font-size: 13px;
  font-weight: 600;
  border: 1px solid #dbe6fe;
`;

const HorizontalDivider = styled.hr`
  border: none;
  border-top: 1px dashed #e2e4ea;
  margin: 6px 0;
  width: 100%;
`;

const LinkTag = styled.a`
  color: #2b6cb0;
  font-weight: 600;
  text-decoration: underline;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 3px;
  margin: 0 2px;
  word-break: break-all;

  svg {
    flex-shrink: 0;
  }

  &:hover {
    color: #1a4971;
  }
`;
