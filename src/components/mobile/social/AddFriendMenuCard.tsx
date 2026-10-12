import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import styled, { keyframes } from "styled-components";
import { UserRoundSearch } from "lucide-react";
import Icon from "@/components/common/Icon";
import { createPortal } from "react-dom";

/**
 * 친구 추가 FAB을 눌렀을 때 뜨는 카드형 드롭다운 메뉴.
 *
 * 채팅 목록(친구 탭)과 친구 목록(시간표 → 친구) 두 진입 경로가 서로 다른 UI를 쓰던 것을
 * 하나로 통일한 컴포넌트.
 *
 * Scrim과 MenuCard를 모두 document.body 포털 안에서 형제 요소로 렌더링하여,
 * 부모 컨테이너의 어떠한 stacking context(isolation, transform, overflow 등)에도
 * Scrim이 MenuCard를 가리는 현상이 발생하지 않도록 보장한다.
 */
interface AddFriendMenuCardProps {
  open: boolean;
  onScrimClick: () => void;
  onSearchClick: () => void;
  onNearbyClick: () => void;
  onInviteClick: () => void;
}

export default function AddFriendMenuCard({
  open,
  onScrimClick,
  onSearchClick,
  onNearbyClick,
  onInviteClick,
}: AddFriendMenuCardProps) {
  const anchorRef = useRef<HTMLSpanElement>(null);
  const [menuPosition, setMenuPosition] = useState<{
    bottom: number;
    right: number;
  }>({ bottom: 160, right: 24 });
  const [isRendered, setIsRendered] = useState(open);

  const updatePosition = useCallback(() => {
    if (anchorRef.current) {
      const rect = anchorRef.current.getBoundingClientRect();
      if (rect.top !== 0 || rect.right !== 0) {
        setMenuPosition({
          bottom: window.innerHeight - rect.top + 12,
          right: window.innerWidth - rect.right,
        });
      }
    }
  }, []);

  useLayoutEffect(() => {
    if (open) {
      updatePosition();
      setIsRendered(true);
    }
  }, [open, updatePosition]);

  useEffect(() => {
    if (!open) return;
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition);
    };
  }, [open, updatePosition]);

  const handleAnimationEnd = () => {
    if (!open) {
      setIsRendered(false);
    }
  };

  const handleScrimDismiss = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onScrimClick();
  };

  const handleRowClick = (
    e: React.MouseEvent,
    handler: () => void,
  ) => {
    e.preventDefault();
    e.stopPropagation();
    handler();
  };

  return (
    <>
      <span
        ref={anchorRef}
        aria-hidden="true"
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: 0,
          height: 0,
          pointerEvents: "none",
        }}
      />
      {isRendered &&
        createPortal(
          <>
            <Scrim
              onClick={handleScrimDismiss}
              onTouchEnd={handleScrimDismiss}
            />
            <MenuCard
              $open={open}
              onAnimationEnd={handleAnimationEnd}
              style={{
                bottom: `${menuPosition.bottom}px`,
                right: `${menuPosition.right}px`,
              }}
            >
              <MenuRow
                type="button"
                onClick={(e) => handleRowClick(e, onSearchClick)}
              >
                <UserRoundSearch size={20} />
                닉네임으로 찾기
              </MenuRow>
              <MenuRow
                type="button"
                onClick={(e) => handleRowClick(e, onNearbyClick)}
              >
                <Icon
                  name="location"
                  size={20}
                  color="var(--interactive-primary)"
                />
                주변 친구 찾기
              </MenuRow>
              <MenuRow
                type="button"
                onClick={(e) => handleRowClick(e, onInviteClick)}
              >
                <Icon
                  name="qr-code"
                  size={20}
                  color="var(--interactive-primary)"
                />
                링크·QR로 초대
              </MenuRow>
            </MenuCard>
          </>,
          document.body,
        )}
    </>
  );
}

const unfurlAnimation = keyframes`
  from {
    transform: scale(0.92) translateY(8px);
    opacity: 0;
  }
  to {
    transform: scale(1) translateY(0);
    opacity: 1;
  }
`;

const furlAnimation = keyframes`
  from {
    transform: scale(1) translateY(0);
    opacity: 1;
  }
  to {
    transform: scale(0.92) translateY(8px);
    opacity: 0;
  }
`;

const Scrim = styled.div`
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  z-index: 1000;
  background: transparent;
  cursor: default;
  -webkit-tap-highlight-color: transparent;
`;

const MenuCard = styled.div<{ $open: boolean }>`
  position: fixed;
  display: flex;
  flex-direction: column;
  min-width: 190px;
  padding: 8px;
  background-color: var(--bg-base);
  border: 1px solid var(--border-default);
  border-radius: 20px;
  box-shadow: 0px 8px 24px rgba(0, 0, 0, 0.12);
  transform-origin: bottom right;
  animation: ${({ $open }) => ($open ? unfurlAnimation : furlAnimation)} 0.18s
    cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  pointer-events: ${({ $open }) => ($open ? "auto" : "none")};
  z-index: 1002;
`;

const MenuRow = styled.button`
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 12px 10px;
  border: none;
  background: none;
  border-radius: 14px;
  color: var(--text-primary);
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  text-align: left;
  outline: none;

  & > svg {
    flex-shrink: 0;
    color: var(--interactive-primary);
  }

  &:active {
    background-color: var(--bg-muted);
  }
`;
