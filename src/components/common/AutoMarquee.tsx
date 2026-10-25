import { useRef, useState, useEffect, memo } from "react";
import styled, { keyframes, css } from "styled-components";

export interface AutoMarqueeProps {
  text: string;
  speedSec?: number;
  className?: string;
}

const marqueeScroll = keyframes`
  0% { transform: translateX(0); }
  20% { transform: translateX(0); }
  80% { transform: translateX(calc(-100% + var(--marquee-container-width))); }
  100% { transform: translateX(calc(-100% + var(--marquee-container-width))); }
`;

/**
 * 텍스트가 컨테이너 너비를 초과할 때만 조용히 왕복 흐르는 마키 컴포넌트
 *
 * - 박스보다 짧은 일반 텍스트는 정적으로 표시됩니다.
 * - 넘칠 때만 양 끝에서 잠시 멈췄다가 부드럽게 흐릅니다(alternate).
 * - 모션 줄이기 설정 시 애니메이션이 비활성화됩니다.
 */
export const AutoMarquee = memo(({ text, speedSec = 5, className }: AutoMarqueeProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    if (!containerRef.current || !textRef.current) return;
    const cw = containerRef.current.clientWidth;
    const tw = textRef.current.scrollWidth;
    setContainerWidth(cw);
    setIsOverflowing(tw > cw);
  }, [text]);

  return (
    <MarqueeContainer
      ref={containerRef}
      className={className}
      style={{ "--marquee-container-width": `${containerWidth}px` } as React.CSSProperties}
    >
      <MarqueeText ref={textRef} $isOverflowing={isOverflowing} $speedSec={speedSec}>
        {text}
      </MarqueeText>
    </MarqueeContainer>
  );
});

AutoMarquee.displayName = "AutoMarquee";

export default AutoMarquee;

const MarqueeContainer = styled.div`
  overflow: hidden;
  white-space: nowrap;
  width: 100%;
  min-width: 0;
  display: block;
`;

const MarqueeText = styled.span<{ $isOverflowing: boolean; $speedSec: number }>`
  display: inline-block;
  white-space: nowrap;
  will-change: transform;

  ${({ $isOverflowing, $speedSec }) =>
    $isOverflowing
      ? css`
          animation: ${marqueeScroll} ${$speedSec}s ease-in-out infinite alternate;

          @media (prefers-reduced-motion: reduce) {
            animation: none !important;
          }
        `
      : css`
          overflow: hidden;
          text-overflow: ellipsis;
        `}
`;
