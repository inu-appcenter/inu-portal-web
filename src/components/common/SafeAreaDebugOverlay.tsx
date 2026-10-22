import { useState } from "react";
import styled from "styled-components";

/**
 * 개발자용 Safe Area 시각적 디버거 (Dev Overlay)
 * URL 파라미터로 `?debugSafeArea=1` 전달 시 활성화됩니다.
 * 상단 노치/상태표시줄(44px)과 하단 홈 제스처 바(34px) 영역을 반투명 가이드로 표시하여
 * 브라우저에서 버튼 겹침 및 여백을 즉시 육안 검증할 수 있습니다.
 */
export default function SafeAreaDebugOverlay() {
  const [isEnabled] = useState(() => {
    if (typeof window !== "undefined" && import.meta.env.DEV) {
      const params = new URLSearchParams(window.location.search);
      return params.get("debugSafeArea") === "1";
    }
    return false;
  });

  if (!isEnabled) return null;

  return (
    <OverlayContainer aria-hidden="true">
      <TopGuide>
        <GuideLabel>TOP SAFE AREA (44px)</GuideLabel>
      </TopGuide>
      <BottomGuide>
        <GuideLabel>BOTTOM SAFE AREA (34px - Home Indicator)</GuideLabel>
      </BottomGuide>
    </OverlayContainer>
  );
}

const OverlayContainer = styled.div`
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 999999;
`;

const TopGuide = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: var(--native-safe-area-inset-top, env(safe-area-inset-top, 44px));
  background: rgba(239, 68, 68, 0.18);
  border-bottom: 2px dashed rgba(239, 68, 68, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
`;

const BottomGuide = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: var(--native-safe-area-inset-bottom, env(safe-area-inset-bottom, 34px));
  background: rgba(59, 130, 246, 0.22);
  border-top: 2px dashed rgba(59, 130, 246, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
`;

const GuideLabel = styled.span`
  font-size: 11px;
  font-weight: 700;
  color: #1f2937;
  background: rgba(255, 255, 255, 0.85);
  padding: 2px 8px;
  border-radius: 4px;
  letter-spacing: -0.2px;
`;
