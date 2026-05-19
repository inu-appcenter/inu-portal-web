import styled from "styled-components";
import { ChevronsLeft, ChevronsRight } from "lucide-react";

interface SwipeChevronGuidesProps {
  hasSwiped: boolean;
  currentIndex: number;
  totalSlides: number;
}

/**
 * 최초 가로 스와이프를 인지할 수 있도록 모바일 디바이스 양쪽 끝에
 * 앰비언트하게 바운싱 애니메이션을 선사하는 셰브론 힌트 화살표 공통 컴포넌트
 */
export default function SwipeChevronGuides({
  hasSwiped,
  currentIndex,
  totalSlides,
}: SwipeChevronGuidesProps) {
  if (hasSwiped || totalSlides <= 1) return null;

  return (
    <>
      {currentIndex > 0 && (
        <SwipeGuideLeft>
          <ChevronsLeft size={32} />
        </SwipeGuideLeft>
      )}
      {currentIndex < totalSlides - 1 && (
        <SwipeGuideRight>
          <ChevronsRight size={32} />
        </SwipeGuideRight>
      )}
    </>
  );
}

const SwipeGuideLeft = styled.div`
  position: fixed;
  left: 6px;
  top: 50%;
  transform: translateY(-50%) scaleY(1.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  pointer-events: none;
  color: rgba(94, 146, 240, 0.8);
  animation: bounceLeft 2s infinite ease-in-out;

  @keyframes bounceLeft {
    0%, 100% {
      transform: translateY(-50%) scaleY(1.4) translateX(0);
      opacity: 0.35;
    }
    50% {
      transform: translateY(-50%) scaleY(1.4) translateX(-8px);
      opacity: 0.95;
    }
  }
`;

const SwipeGuideRight = styled.div`
  position: fixed;
  right: 6px;
  top: 50%;
  transform: translateY(-50%) scaleY(1.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  pointer-events: none;
  color: rgba(94, 146, 240, 0.8);
  animation: bounceRight 2s infinite ease-in-out;

  @keyframes bounceRight {
    0%, 100% {
      transform: translateY(-50%) scaleY(1.4) translateX(0);
      opacity: 0.35;
    }
    50% {
      transform: translateY(-50%) scaleY(1.4) translateX(8px);
      opacity: 0.95;
    }
  }
`;
