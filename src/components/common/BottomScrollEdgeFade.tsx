import { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import styled from "styled-components";
import { isMainTabPath } from "@/constants/routes";
import { SAFE_AREA } from "@/styles/safeArea";

interface BottomScrollEdgeFadeProps {
  /**
   * 특정 페이지나 상위 컨텍스트에서 명시적으로 숨길 때 사용
   */
  hidden?: boolean;
}

/**
 * 하단 스크롤 엣지 페이드 효과를 적용하지 않을 예외 경로 판별 함수
 */
export function isBottomEdgeFadeExcluded(pathname: string): boolean {
  // 1. 바텀 네비게이션 바가 있는 메인 화면들 (홈, 시간표, 채팅 목록, 마이페이지, 버스, 저장 등)
  if (isMainTabPath(pathname)) return true;
  // 2. 채팅방 (메시지 목록 독립 내부 스크롤 뷰 및 하단 입력창 고정)
  if (pathname.startsWith("/chat/")) return true;
  // 3. 모의 수강신청 시뮬레이터 (전체화면 풀스크린 iframe 웹뷰)
  if (pathname.startsWith("/timetable/simulator")) return true;
  // 4. AI 에이전트 / 어시스턴트
  if (pathname.startsWith("/agent") || pathname.startsWith("/assistant")) return true;
  // 5. 모바일 기숙사/학생증 전체화면 카드 (일반 및 실험실 경로 포함)
  if (pathname.includes("/dormitory/card")) return true;
  return false;
}

export interface ScrollFadeCalculationParams {
  scrollY: number;
  viewportHeight: number;
  scrollHeight: number;
  isExcluded: boolean;
}

/**
 * 스크롤 상태에 따른 페이드 오버레이 가시성 판별 순수 함수
 *
 * - 스크롤 가능한 컨텐츠가 존재할 때만 노출
 * - 최하단에 도달(오차 버퍼 8px 이내)하면 부드럽게 숨김 (false)
 * - 뷰포트보다 짧아서 스크롤이 불필요하면 숨김 (false)
 */
export function computeScrollFadeState({
  scrollY,
  viewportHeight,
  scrollHeight,
  isExcluded,
}: ScrollFadeCalculationParams): boolean {
  if (isExcluded) return false;

  // 스크롤 가능한 높이가 있는지 확인 (뷰포트보다 최소 12px 이상 길어야 유효한 스크롤 컨텐츠로 간주)
  const isScrollable = scrollHeight > viewportHeight + 12;

  // 최하단에 도달했는지 확인 (오차 버퍼 8px: 모바일 뷰포트의 소수점 렌더링 오차 대응)
  const isAtBottom = scrollY + viewportHeight >= scrollHeight - 8;

  return isScrollable && !isAtBottom;
}

/**
 * 갤럭시(One UI) 스타일의 동적 하단 스크롤 엣지 페이드 컴포넌트
 *
 * - 바텀 네비게이션 바가 없는 서브페이지 화면에서 동작
 * - 스크롤 가능한 컨텐츠가 존재할 때만 은은한 하단 엣지 페이드 노출
 * - 스크롤이 최하단에 도달하면 자연스럽게 fade-out (opacity: 0)
 * - 스크롤할 내용이 없거나 짧은 페이지에서는 자동으로 숨김
 * - 바텀 네비게이션 바가 있는 메인 화면(홈, 시간표, 채팅, 마이페이지 등)은 완전 제외
 */
export default function BottomScrollEdgeFade({ hidden = false }: BottomScrollEdgeFadeProps) {
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(false);
  const rafIdRef = useRef<number | null>(null);

  const isExcluded = hidden || isBottomEdgeFadeExcluded(location.pathname);

  useEffect(() => {
    if (isExcluded) {
      setIsVisible(false);
      return;
    }

    const checkScroll = () => {
      const scrollY = window.scrollY;
      const innerHeight = window.innerHeight;
      const scrollHeight = document.documentElement.scrollHeight;

      const nextVisible = computeScrollFadeState({
        scrollY,
        viewportHeight: innerHeight,
        scrollHeight,
        isExcluded,
      });

      setIsVisible(nextVisible);
    };

    const handleScroll = () => {
      if (rafIdRef.current !== null) return;
      rafIdRef.current = window.requestAnimationFrame(() => {
        checkScroll();
        rafIdRef.current = null;
      });
    };

    // 초기 마운트 시 검사 및 DOM 렌더링/데이터 페칭 직후 재검사
    checkScroll();
    const timerId = setTimeout(checkScroll, 100);

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });

    // 컨텐츠 높이 동적 변화(무한스크롤, 탭 전환, 이미지 로드) 감지
    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(() => {
        handleScroll();
      });
      if (document.documentElement) {
        resizeObserver.observe(document.documentElement);
      }
      if (document.body) {
        resizeObserver.observe(document.body);
      }
    }

    return () => {
      if (rafIdRef.current !== null) {
        window.cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
      clearTimeout(timerId);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, [location.pathname, location.search, isExcluded]);

  if (isExcluded) {
    return null;
  }

  return (
    <FadeContainer
      $isVisible={isVisible}
      aria-hidden="true"
      data-testid="bottom-scroll-edge-fade"
    />
  );
}

const FadeContainer = styled.div<{ $isVisible: boolean }>`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  width: 100%;
  height: calc(44px + ${SAFE_AREA.BOTTOM});
  pointer-events: none;
  z-index: 45;
  opacity: ${({ $isVisible }) => ($isVisible ? 1 : 0)};
  transform: translateZ(0);
  transition: opacity 0.22s cubic-bezier(0.4, 0, 0.2, 1);

  background: linear-gradient(
    180deg,
    rgba(248, 249, 251, 0) 0%,
    rgba(248, 249, 251, 0.45) 30%,
    rgba(248, 249, 251, 0.95) calc(100% - ${SAFE_AREA.BOTTOM}),
    rgba(248, 249, 251, 0.95) 100%
  );
`;
