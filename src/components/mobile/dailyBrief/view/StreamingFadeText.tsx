import { Fragment } from "react";
import styled, { css, keyframes } from "styled-components";

interface StreamingFadeTextProps {
  text: string;
  animate?: boolean;
  startDelayMs?: number;
  wordDelayMs?: number;
}

export default function StreamingFadeText({
  text,
  animate = true,
  startDelayMs = 0,
  wordDelayMs = 70,
}: StreamingFadeTextProps) {
  const words = text.trim().split(/\s+/);

  return (
    <TextGroup aria-label={text}>
      {words.map((word, index) => (
        <Fragment key={`${text}-${word}-${index}`}>
          {index > 0 && " "}
          <Word
            aria-hidden="true"
            $animate={animate}
            $delayMs={startDelayMs + index * wordDelayMs}
          >
            {word}
          </Word>
        </Fragment>
      ))}
    </TextGroup>
  );
}

const wordFadeIn = keyframes`
  from {
    opacity: 0.08;
    filter: blur(2px);
  }
  to {
    opacity: 1;
    filter: blur(0);
  }
`;

const TextGroup = styled.span`
  word-break: keep-all;
  overflow-wrap: break-word;
`;

const Word = styled.span<{ $animate: boolean; $delayMs: number }>`
  display: inline-block;

  ${({ $animate, $delayMs }) =>
    $animate
      ? css`
          opacity: 0;
          animation: ${wordFadeIn} 0.42s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          animation-delay: ${$delayMs}ms;
        `
      : css`
          opacity: 1;
        `}

  @media (prefers-reduced-motion: reduce) {
    opacity: 1;
    animation: none;
    filter: none;
  }
`;
