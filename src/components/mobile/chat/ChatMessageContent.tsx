import React, { useMemo } from "react";
import styled from "styled-components";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
// KaTeX 기본 CSS는 woff2/woff/ttf 3중 포맷을 모두 번들에 포함시킨다.
// woff2만 지원하면 충분하므로(모던 브라우저 + WebView), woff2 전용으로 가공한
// 사본을 대신 사용한다. node_modules는 수정하지 않는다.
import "../../../styles/katex-woff2-only.css";
import { ExternalLink } from "lucide-react";

interface ChatMessageContentProps {
  content: string;
}

/**
 * URL 끝에 붙은 문장 부호와 괄호, 따옴표를 분리하여 정제하는 함수
 */
const cleanUrl = (url: string) => {
  let end = url.length;
  while (end > 0 && /[.,!?;:\])"']/.test(url[end - 1])) {
    end--;
  }
  return {
    cleaned: url.substring(0, end),
    rest: url.substring(end),
  };
};

/**
 * 프로토콜(http/https)이 누락된 도메인 URL에 https:// 스킴을 추가하는 함수
 */
const ensureHttpScheme = (url: string) => {
  if (/^https?:\/\//i.test(url)) {
    return url;
  }
  return `https://${url}`;
};

/**
 * 마크다운 링크([label](url)), 일반 HTTP(S) URL, 스킴 없는 도메인 주소(portal.inu.ac.kr 등)를 구분하여 처리하는 정규표현식
 */
const COMBINED_LINK_REGEX =
  /\[([^\]]*)\]\((https?:\/\/[^\s)]+)\)|(https?:\/\/[^\s가-힣\]()<>"]+)|(?<![a-zA-Z0-9@/])((?:www\.[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*(?:\/[^\s가-힣\]()<>"]*)?|[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\.(?:inu\.ac\.kr|ac\.kr|co\.kr|go\.kr|or\.kr|re\.kr|kr|com|org|net|edu|gov|io|ai|app|me|info|biz|site|xyz|dev|page|gle|gl)(?:\/[^\s가-힣\]()<>"]*)?))/g;

/**
 * AI 응답에서 자주 나오는 LaTeX 수학/화살표 기호 매핑
 */
const LATEX_SYMBOLS: Record<string, string> = {
  rightarrow: "→",
  to: "→",
  leftarrow: "←",
  gets: "←",
  leftrightarrow: "↔",
  Rightarrow: "⇒",
  Leftarrow: "⇐",
  Leftrightarrow: "⇔",
  pm: "±",
  times: "×",
  div: "÷",
  neq: "≠",
  ne: "≠",
  leq: "≤",
  le: "≤",
  geq: "≥",
  ge: "≥",
  approx: "≈",
  cdot: "·",
  bullet: "•",
  dots: "…",
  cdots: "⋯",
  infty: "∞",
  deg: "°",
};

/**
 * AI 응답 텍스트를 마크다운 엔진이 잘 해석할 수 있도록 전처리하는 함수 (UNIDorm 방식)
 */
const preprocessMarkdown = (rawText: string): string => {
  if (!rawText) return rawText;

  let text = rawText;

  // 1. JSON 직렬화나 API 응답에서 전달된 리터럴 \n, \r\n, \r 문자열을 실제 개행 문자로 치환
  text = text
    .replace(/\\r\\n/g, "\n")
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "\n")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n");

  // 1-1. 개행 없이 이어진 마크다운 구조(헤더, 구분선, 출처, 연속 링크 등) 방어적 개행 보정 (레거시 DB 데이터 대응)
  text = text.replace(/([^\n])(#{1,6}\s+)/g, "$1\n\n$2");
  text = text.replace(/([^\n])(---)/g, "$1\n\n$2");
  text = text.replace(/(---)([^\n])/g, "$1\n\n$2");
  text = text.replace(/([^\n])(\[출처\])/g, "$1\n\n$2");
  text = text.replace(/(\[출처\])([^\n])/g, "$1\n$2");
  text = text.replace(/(\]\(https?:\/\/[^\s)]+\))(?=\[)/g, "$1\n");

  // 2. 레거시 태그 및 접두사 제거
  text = text.replace(/\[CHATBULI_ANSWER\]/g, "");
  text = text.replace(/^\[챗불이 답변\]\s*/g, "");

  // 0. URL이 비어 있는 출처 마크다운 링크 항목 제거 ([제목](), - [제목]() 등)
  text = text.replace(
    /^[ \t]*(?:[-*+]|\d+\.)?[ \t]*\[[^\]]*\]\(\s*\)[ \t]*\r?\n?/gm,
    "",
  );
  text = text.replace(/\[[^\]]*\]\(\s*\)/g, "");

  // 0-1. 출처에 '없음'으로만 표기된 경우 (동일 라인 또는 다음 라인) 해당 내용 및 헤더 제거
  text = text.replace(
    /(?:\r?\n|^)[ \t]*(?:#{1,6}\s*)?(?:\*{1,2})?\[?(?:출처|참고자료|참고\s*자료)\]?(?:\*{1,2})?:?[ \t]*(?:\(?\s*(?:없음|해당\s*없음|조문\s*없음|none|n\/a)\s*\)?)[ \t]*(?=\r?\n|$)/gi,
    "",
  );
  text = text.replace(
    /((?:\r?\n|^)[ \t]*(?:#{1,6}\s*)?(?:\*{1,2})?\[?(?:출처|참고자료|참고\s*자료)\]?(?:\*{1,2})?:?[ \t]*\r?\n)[ \t]*(?:[-*+]|\d+\.)?[ \t]*(?:\(?\s*(?:없음|해당\s*없음|조문\s*없음|none|n\/a)\s*\)?)[ \t]*(?=\r?\n|$)/gi,
    "$1",
  );

  // 0-2. 출처 항목이 모두 제거되어 빈 [출처] 헤더만 남은 경우 헤더 제거
  text = text.replace(
    /(?:\r?\n|^)[ \t]*(?:#{1,6}\s*)?(?:\*{1,2})?\[?(?:출처|참고자료|참고\s*자료)\]?(?:\*{1,2})?:?[ \t]*(?=\r?\n\s*(?:#{1,6}\s*|\*{1,2}\[?|$)|$)/gi,
    "",
  );

  // 1. LaTeX 기호 치환 ($\rightarrow$, $\to$, \rightarrow 등)
  text = text.replace(
    /\$(?:\\?([a-zA-Z]+))\$/g,
    (match, symbol) => LATEX_SYMBOLS[symbol] || match,
  );
  text = text.replace(
    /\\(rightarrow|to|leftarrow|gets|leftrightarrow|Rightarrow|Leftarrow|Leftrightarrow|pm|times|div|neq|ne|leq|le|geq|ge|approx|cdot|bullet|dots|cdots|infty|deg)\b/g,
    (match, symbol) => LATEX_SYMBOLS[symbol] || match,
  );

  // 2. '=== 섹션 제목 ===' 형태를 Setext 헤딩으로 오인하지 않도록 안전하게 변환
  text = text.replace(
    /^[ \t]*={3,}[ \t]*(.*?)[ \t]*={3,}[ \t]*$/gm,
    (_, inner) => {
      const trimmed = inner.trim();
      return trimmed ? `\n> **${trimmed}**\n` : "\n---\n";
    },
  );

  // 3. 단독 '===' 구분선이 앞 문장과 합쳐져 H1으로 변환되는 것 방지
  text = text.replace(/(.)\n(={3,}|-{3,})(\n|$)/g, "$1\n\n$2$3");

  // 4. URL/링크 정제
  text = text.replace(
    COMBINED_LINK_REGEX,
    (match, label, link, nakedScheme, nakedDomain) => {
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
    },
  );

  // 5. HTML 태그가 아닌 한글/일반 텍스트가 담긴 <식별자> 형태 이스케이프 (<학적변동관리> 등)
  text = text.replace(/<([^>/\s]+)>/g, (match, tag) => {
    if (
      /^https?:\/\//i.test(tag) ||
      /^(br|b|i|u|strong|em|code|pre|p|span|div|table|th|td|tr|tbody|thead|ul|ol|li|hr|img|a)$/i.test(
        tag,
      )
    ) {
      return match;
    }
    return `&lt;${tag}&gt;`;
  });

  // 6. LaTeX 수식 오타 및 문법 보정
  text = text.replace(/\|text\s*\{/g, "\\text{");
  text = text.replace(/\\text\s+\{/g, "\\text{");

  // 7. 마크다운 볼드(**) 내부의 따옴표나 괄호가 CommonMark flanking 규칙을 깨뜨리지 않도록 보정
  text = text.replace(
    /\*\*([`'""‘’“”\(\[\{<])([^*]+?)([`'""‘’“”\)\]\}>])\*\*/g,
    "$1**$2**$3",
  );
  text = text.replace(
    /\*\*([^*]+?)([`'""‘’“”\)\]\}]+)\*\*([가-힣a-zA-Z0-9])/g,
    "**$1**$2$3",
  );
  text = text.replace(
    /([가-힣a-zA-Z0-9])\*\*([`'""‘’“”\(\[\{<]+)([^*]+?)\*\*/g,
    "$1$2**$3**",
  );

  return text;
};

/**
 * 링크 텍스트가 URL 날것인 경우 "바로가기"로 대체하는 헬퍼 함수
 */
const renderLinkText = (children: React.ReactNode, href?: string) => {
  if (typeof children === "string") {
    const trimmed = children.trim();
    if (
      trimmed.startsWith("http://") ||
      trimmed.startsWith("https://") ||
      trimmed === href
    ) {
      return "바로가기";
    }
  }
  if (Array.isArray(children) && children.length === 1) {
    const firstChild = children[0];
    if (typeof firstChild === "string") {
      const trimmed = firstChild.trim();
      if (
        trimmed.startsWith("http://") ||
        trimmed.startsWith("https://") ||
        trimmed === href
      ) {
        return "바로가기";
      }
    }
  }
  return children;
};

const markdownComponents: any = {
  p: ({ children }: { children: React.ReactNode }) => <p>{children}</p>,
  li: ({ children }: { children: React.ReactNode }) => <li>{children}</li>,
  strong: ({ children }: { children: React.ReactNode }) => (
    <strong>{children}</strong>
  ),
  em: ({ children }: { children: React.ReactNode }) => <em>{children}</em>,
  h1: ({ children }: { children: React.ReactNode }) => <h1>{children}</h1>,
  h2: ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>,
  h3: ({ children }: { children: React.ReactNode }) => <h3>{children}</h3>,
  h4: ({ children }: { children: React.ReactNode }) => <h4>{children}</h4>,
  h5: ({ children }: { children: React.ReactNode }) => <h5>{children}</h5>,
  h6: ({ children }: { children: React.ReactNode }) => <h6>{children}</h6>,
  blockquote: ({ children }: { children: React.ReactNode }) => (
    <blockquote>{children}</blockquote>
  ),
  table: ({ children, ...props }: any) => (
    <div style={{ overflowX: "auto", margin: "8px 0" }}>
      <table {...props}>{children}</table>
    </div>
  ),
  a: ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href?: string;
    [key: string]: any;
  }) => {
    if (!href || !href.trim()) {
      return null;
    }
    return (
      <a
        {...props}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
      >
        <span>{renderLinkText(children, href)}</span>
        <ExternalLink
          size={12}
          style={{
            display: "inline-block",
            verticalAlign: "middle",
            marginLeft: "2px",
            flexShrink: 0,
          }}
        />
      </a>
    );
  },
};

export default function ChatMessageContent({ content }: ChatMessageContentProps) {
  const processed = useMemo(() => preprocessMarkdown(content), [content]);

  return (
    <MarkdownContainer>
      <ReactMarkdown
        remarkPlugins={[
          [remarkGfm, { singleTilde: false }],
          remarkBreaks,
          remarkMath,
        ]}
        rehypePlugins={[rehypeKatex]}
        components={markdownComponents}
      >
        {processed}
      </ReactMarkdown>
    </MarkdownContainer>
  );
}

const MarkdownContainer = styled.div`
  width: 100%;
  font-size: 14px;
  line-height: 1.55;
  word-break: break-word;
  overflow-wrap: break-word;
  color: #1c1c1e;

  p {
    margin: 0 0 6px 0;
  }
  p:last-child {
    margin: 0;
  }

  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    margin: 12px 0 5px 0;
    font-weight: 700;
    line-height: 1.35;
    color: inherit;
    &:first-child {
      margin-top: 0;
    }
  }
  h1 {
    font-size: 1.18em;
  }
  h2 {
    font-size: 1.1em;
  }
  h3 {
    font-size: 1.05em;
  }
  h4,
  h5,
  h6 {
    font-size: 1em;
  }

  a {
    color: #2b6cb0;
    text-decoration: underline;
    font-weight: 500;
    word-break: break-all;
    display: inline-flex;
    align-items: center;
    gap: 2px;

    &:hover {
      color: #1a4971;
    }
  }

  ul,
  ol {
    margin: 6px 0;
    padding-left: 18px;
  }
  li {
    margin-bottom: 3px;
  }
  li:last-child {
    margin-bottom: 0;
  }

  strong {
    font-weight: 700;
    color: #111111;
  }

  code {
    background-color: rgba(0, 0, 0, 0.05);
    padding: 2px 5px;
    border-radius: 4px;
    font-family: monospace;
    font-size: 12.5px;
  }

  pre {
    background-color: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    padding: 8px 12px;
    overflow-x: auto;
    margin: 6px 0;

    code {
      background-color: transparent;
      padding: 0;
      border-radius: 0;
      font-size: 12.5px;
    }
  }

  blockquote {
    margin: 6px 0;
    padding: 5px 10px;
    border-left: 3.5px solid #5e92f0;
    background-color: rgba(94, 146, 240, 0.06);
    border-radius: 0 6px 6px 0;
    color: #4a5568;

    p {
      margin: 0;
    }
  }

  hr {
    border: none;
    border-top: 1px solid #e2e8f0;
    margin: 12px 0;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    margin: 8px 0;
    font-size: 12.5px;
    text-align: left;
  }

  th {
    background-color: rgba(94, 146, 240, 0.08);
    color: #1c1c1e;
    font-weight: 600;
    padding: 6px 10px;
    border: 1px solid #e2e8f0;
  }

  td {
    padding: 6px 10px;
    border: 1px solid #e2e8f0;
  }

  tr:nth-child(even) td {
    background-color: rgba(0, 0, 0, 0.015);
  }

  input[type="checkbox"] {
    margin-right: 5px;
    vertical-align: middle;
  }

  /* KaTeX Math Styles */
  .katex-display {
    overflow-x: auto;
    overflow-y: hidden;
    padding: 6px 0;
    margin: 6px 0;
  }

  .katex {
    font-size: 1em;
    text-rendering: auto;
  }
`;
