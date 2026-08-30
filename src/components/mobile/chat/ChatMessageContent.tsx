import React from "react";
import styled from "styled-components";
import { Sparkles } from "lucide-react";

interface ChatMessageContentProps {
  content: string;
}

export default function ChatMessageContent({ content }: ChatMessageContentProps) {
  // 본문에서 [CHATBULI_ANSWER] 식별 태그 및 [챗불이 답변] 접두사 정돈
  const cleanedContent = React.useMemo(() => {
    if (!content) return "";
    let text = content;
    text = text.replace(/\[CHATBULI_ANSWER\]/g, "");
    text = text.replace(/^\[챗불이 답변\]\s*/g, "");
    return text.trim();
  }, [content]);

  // URL 링크를 "바로가기" 텍스트 링크로 변환 및 인라인 마크다운 렌더링
  const renderInlineMarkdownAndLinks = (text: string) => {
    if (!text) return null;

    // URL 정규식 패턴 (http, https)
    const urlPattern = /(https?:\/\/[^\s]+)/g;

    // 먼저 URL 기준으로 split
    const urlTokens = text.split(urlPattern);

    return urlTokens.map((token, tIdx) => {
      if (urlPattern.test(token)) {
        return (
          <LinkTag
            key={`url-${tIdx}`}
            href={token}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
          >
            [바로가기]
          </LinkTag>
        );
      }

      // URL이 아닌 일반 텍스트 부분은 볼드(**), 코드(`), 이탤릭(*) 파싱
      const parts = token.split(
        /(\*\*\*[^*]+?\*\*\*|\*\*[^*]+?\*\*|`[^`]+?`|\*[^*]+?\*)/g,
      );

      return parts.map((part, pIdx) => {
        if (part.startsWith("***") && part.endsWith("***") && part.length >= 6) {
          return (
            <BoldText key={`b-${pIdx}`}>
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

        // 0. 가로선 (***, ---, ___)
        if (/^(\*{3,}|-{3,}|_{3,})$/.test(trimmed)) {
          return <HorizontalDivider key={idx} />;
        }

        // 1. 헤더 (#, ##, ###)
        if (/^#{1,6}\s+/.test(trimmed)) {
          const headerText = trimmed.replace(/^#{1,6}\s+/, "");
          return (
            <SectionHeader key={idx}>
              <Sparkles size={14} color="#FF6B00" />
              <span>{renderInlineMarkdownAndLinks(headerText)}</span>
            </SectionHeader>
          );
        }

        // 2. 번호 목록 (1. , 2. 등)
        if (/^\d+\.\s+/.test(trimmed)) {
          const numberPrefix = trimmed.match(/^(\d+\.)\s+/)?.[1] || "";
          const listText = trimmed.replace(/^\d+\.\s+/, "");
          return (
            <NumberedItem key={idx}>
              <NumberLabel>{numberPrefix}</NumberLabel>
              <div className="list-text">
                {renderInlineMarkdownAndLinks(listText)}
              </div>
            </NumberedItem>
          );
        }

        // 3. 불릿 목록 (-, *, •, +)
        if (/^[-*•+]\s+/.test(trimmed)) {
          const bulletText = trimmed.replace(/^[-*•+]\s+/, "");
          return (
            <BulletItem key={idx}>
              <BulletDot />
              <div className="list-text">
                {renderInlineMarkdownAndLinks(bulletText)}
              </div>
            </BulletItem>
          );
        }

        // 4. 일반 문단
        return (
          <Paragraph key={idx}>
            {renderInlineMarkdownAndLinks(line)}
          </Paragraph>
        );
      })}
    </ContentContainer>
  );
}

const ContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3px;
  color: #1c1c1e;
  font-size: 15px;
  line-height: 1.55;
  word-break: break-word;
  user-select: text;
  -webkit-user-select: text;
`;

const Paragraph = styled.p`
  margin: 0;
  white-space: pre-wrap;
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 700;
  font-size: 15px;
  color: #1c1c1e;
  margin-top: 6px;
  margin-bottom: 2px;

  svg {
    flex-shrink: 0;
  }
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
  color: #3b6cd4;
  font-weight: 600;
  text-decoration: underline;
  cursor: pointer;
  display: inline-block;
  margin: 0 2px;

  &:hover {
    color: #2552b8;
  }
`;
