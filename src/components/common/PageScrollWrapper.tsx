// src/components/common/PageScrollWrapper.tsx
import React, { useLayoutEffect, useRef, useState } from "react";
import { useLocation, useNavigationType } from "react-router-dom";
import styled from "styled-components";
import useScrollStore from "@/stores/useScrollStore";
import { useHeaderConfig } from "@/context/HeaderContext";

interface Props {
  children: React.ReactNode;
  id?: string;
  isActive: boolean; // 현재 활성화된 페이지인지 여부
}

export default function PageScrollWrapper({ children, id, isActive }: Props) {
  const location = useLocation();
  const navType = useNavigationType();
  const scrollRef = useRef<HTMLDivElement>(null);
  const { scrollPositions, setScrollPosition } = useScrollStore();
  const { setIsScrolled } = useHeaderConfig();

  // 마운트 시점의 정보 고정
  const [frozenPath] = useState(location.pathname);
  const [frozenNavType] = useState(navType);

  useLayoutEffect(() => {
    const target = scrollRef.current;
    if (!target || !isActive) return;

    // 브라우저가 레이아웃을 계산할 시간을 주기 위해 requestAnimationFrame 사용
    requestAnimationFrame(() => {
      if (frozenNavType === "POP") {
        const saved = scrollPositions[frozenPath] || 0;
        target.scrollTop = saved;
        setIsScrolled(saved >= 24);
      } else {
        target.scrollTop = 0;
        setIsScrolled(false);
      }
    });
  }, [isActive]); // 활성화될 때 한 번만 실행

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    // 활성 페이지가 아닐 때는 스크롤 상태 기록 및 헤더 업데이트 중단
    if (!isActive) return;

    const scrollTop = e.currentTarget.scrollTop;
    setIsScrolled(scrollTop >= 24);
    setScrollPosition(frozenPath, scrollTop);
  };

  return (
    <ScrollArea
      ref={scrollRef}
      onScroll={handleScroll}
      id={isActive ? id : undefined}
    >
      {children}
    </ScrollArea>
  );
}

const ScrollArea = styled.div`
  width: 100%;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
  &::-webkit-scrollbar {
    display: none;
  }
`;
