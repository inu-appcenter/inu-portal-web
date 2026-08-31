import { useState, useRef, useEffect } from "react";
import styled from "styled-components";
import { createPortal } from "react-dom";
import Icon from "@/components/common/Icon";

/**
 * 게시글 목록(피드)에서 바로 쓰는 신고/차단 메뉴.
 *
 * App Store 가이드라인 1.2(UGC)는 신고·차단은 물론 "피드에서 게시물을 즉시
 * 숨기는" 수단도 요구한다. 상세 페이지에 들어가지 않고도 처리할 수 있도록
 * 목록 아이템에 붙인다.
 */

interface PostModerationMenuProps {
  postId: number;
  writer?: string;
  onReport: (postId: number) => void;
  /** postId 기준으로 차단한다 — PostResponseDto/PostListResponseDto가 memberId를
   * 내려주지 않아(익명 글 재식별 방지, src/apis/blocks.ts 참고) 서버가 postId로
   * 작성자를 찾아 차단한다. */
  onBlock: (postId: number, nickname: string) => void;
}

export default function PostModerationMenu({
  postId,
  writer,
  onReport,
  onBlock,
}: PostModerationMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });

  // 드롭다운 위치 계산
  useEffect(() => {
    if (isOpen && menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect();
      setMenuPosition({
        top: rect.bottom + window.scrollY,
        left: rect.right + window.scrollX,
      });
    }
  }, [isOpen]);

  // 목록 아이템 전체가 상세로 이동하는 클릭 영역이라 전파를 막아야 한다.
  const stop = (event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
  };

  return (
    <>
      <MenuWrapper onClick={stop} ref={menuRef}>
        <MenuIconBtn
          type="button"
          aria-label="게시글 관리 메뉴"
          onClick={(event) => {
            stop(event);
            setIsOpen((prev) => !prev);
          }}
        >
          <Icon name="dot-vertical" size={18} color="#8B95A1" />
        </MenuIconBtn>
      </MenuWrapper>

      {isOpen &&
        createPortal(
          <>
            <MenuBackdrop
              onClick={(event) => {
                stop(event);
                setIsOpen(false);
              }}
            />
            <DropdownMenu
              style={{
                top: `${menuPosition.top}px`,
                left: `${menuPosition.left}px`,
              }}
            >
              <DropdownItem
                type="button"
                $danger
                onClick={(event) => {
                  stop(event);
                  setIsOpen(false);
                  onReport(postId);
                }}
              >
                신고하기
              </DropdownItem>
              <DropdownItem
                type="button"
                $danger
                onClick={(event) => {
                  stop(event);
                  setIsOpen(false);
                  onBlock(postId, writer || "작성자");
                }}
              >
                작성자 차단하기
              </DropdownItem>
            </DropdownMenu>
          </>,
          document.body
        )}
    </>
  );
}

const MenuWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const MenuIconBtn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: transparent;
  cursor: pointer;
`;

const MenuBackdrop = styled.div`
  position: fixed;
  inset: 0;
  z-index: 20;
`;

const DropdownMenu = styled.div`
  position: fixed;
  z-index: 21;
  display: flex;
  flex-direction: column;
  min-width: 140px;
  padding: 4px 0;
  border-radius: 12px;
  border: 1px solid var(--border-default, #e5e8eb);
  background: var(--bg-base, #ffffff);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
  overflow: hidden;
  transform: translateX(-100%);
`;

const DropdownItem = styled.button<{ $danger?: boolean }>`
  width: 100%;
  padding: 10px 14px;
  border: 0;
  background: transparent;
  text-align: left;
  white-space: nowrap;
  font-family: Pretendard, sans-serif;
  font-size: 14px;
  cursor: pointer;
  color: ${({ $danger }) =>
    $danger ? "var(--text-danger, #f04452)" : "var(--text-primary, #191f28)"};

  &:active {
    background: var(--bg-subtle, #f8f9fb);
  }
`;
