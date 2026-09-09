import * as Dialog from "@radix-ui/react-dialog";
import styled, { keyframes } from "styled-components";
import { useSheetBackHandler } from "@/hooks/useSheetBackHandler";

/**
 * 채팅 메시지 롱프레스 시 나타나는 Context Menu 모달 (Figma Node 5297:16774).
 *
 * 이모지 리액션, 답장, 복사, 공지 및
 * App Store 가이드라인 1.2가 요구하는 세 가지(신고 · 사용자 차단 · 즉시 숨김)를 제공한다.
 */

interface ChatModerationSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  senderNickname: string;
  /** 내가 보낸 메시지면 신고/차단 대신 숨기기만 노출한다. */
  isMine: boolean;
  content?: string;
  onReport: () => void;
  onBlock: () => void;
  onHide: () => void;
}

const EMOJIS = ["❤️", "👍", "😄", "😂", "😮", "😢"];

export default function ChatModerationSheet({
  open,
  onOpenChange,
  senderNickname,
  isMine,
  content,
  onReport,
  onBlock,
  onHide,
}: ChatModerationSheetProps) {
  useSheetBackHandler(open, () => onOpenChange(false), true);

  const handleReaction = (_emoji: string) => {
    onOpenChange(false);
  };

  const handleReply = () => {
    onOpenChange(false);
  };

  const handleCopy = () => {
    if (content) {
      navigator.clipboard.writeText(content);
      alert("메시지가 복사되었습니다.");
    }
    onOpenChange(false);
  };

  const handleNotice = () => {
    onOpenChange(false);
  };

  const handleHide = () => {
    onHide();
    onOpenChange(false);
  };

  const handleReport = () => {
    onOpenChange(false);
    onReport();
  };

  const handleBlock = () => {
    onOpenChange(false);
    onBlock();
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <ModalOverlay />
        <ModalContainer>
          {/* Reactions */}
          <ReactionsBar>
            {EMOJIS.map((emoji) => (
              <ReactionButton
                key={emoji}
                type="button"
                onClick={() => handleReaction(emoji)}
                aria-label={`반응 ${emoji}`}
              >
                <span>{emoji}</span>
              </ReactionButton>
            ))}
          </ReactionsBar>

          {/* Main Actions */}
          <ActionGroup $hasBorder>
            <ActionItem type="button" onClick={handleReply}>
              답장
            </ActionItem>
            <ActionItem type="button" onClick={handleCopy}>
              복사
            </ActionItem>
            <ActionItem type="button" onClick={handleNotice}>
              공지
            </ActionItem>
          </ActionGroup>

          {/* Secondary Actions */}
          <ActionGroup $isBottom>
            <ActionItem type="button" onClick={handleHide}>
              이 메시지 숨기기
            </ActionItem>
            {!isMine && (
              <>
                <ActionItem type="button" $danger onClick={handleReport}>
                  신고하기
                </ActionItem>
                <ActionItem type="button" $danger onClick={handleBlock}>
                  {senderNickname ? `‘${senderNickname}님’ 차단하기` : "차단하기"}
                </ActionItem>
              </>
            )}
          </ActionGroup>
        </ModalContainer>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const scaleUp = keyframes`
  from {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
`;

const ModalOverlay = styled(Dialog.Overlay)`
  position: fixed;
  inset: 0;
  background-color: var(--bg-dim, rgba(0, 0, 0, 0.2));
  backdrop-filter: blur(2px);
  -webkit-backdrop-filter: blur(2px);
  z-index: 19999;
  animation: ${fadeIn} 0.2s cubic-bezier(0.4, 0, 0.2, 1) forwards;
`;

const ModalContainer = styled(Dialog.Content)`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: var(--bg-base, #ffffff);
  border-radius: 32px;
  width: calc(100% - 32px);
  max-width: 328px;
  box-sizing: border-box;
  box-shadow: 0px 4px 12px 0px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  z-index: 20000;
  outline: none;
  animation: ${scaleUp} 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
`;

const ReactionsBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 8px;
  border-bottom: 1px solid var(--border-default, #e5e8eb);
  box-sizing: border-box;
  width: 100%;
`;

const ReactionButton = styled.button`
  flex: 1;
  height: 48px;
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  cursor: pointer;
  border-radius: 12px;
  transition:
    transform 0.15s ease,
    background-color 0.15s ease;

  span {
    font-size: 20px;
    line-height: 1.4;
    user-select: none;
  }

  &:hover {
    background-color: var(--bg-subtle, #f8f9fb);
  }

  &:active {
    transform: scale(1.25);
  }
`;

const ActionGroup = styled.div<{ $hasBorder?: boolean; $isBottom?: boolean }>`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding-top: 8px;
  padding-bottom: ${({ $isBottom }) => ($isBottom ? "12px" : "8px")};
  border-bottom: ${({ $hasBorder }) =>
    $hasBorder ? "1px solid var(--border-default, #e5e8eb)" : "none"};
  box-sizing: border-box;
`;

const ActionItem = styled.button<{ $danger?: boolean }>`
  display: flex;
  align-items: center;
  width: 100%;
  height: 44px;
  padding: 0 24px;
  border: 0;
  background: transparent;
  text-align: left;
  cursor: pointer;
  box-sizing: border-box;
  font-family: "Pretendard", -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.4;
  color: ${({ $danger }) =>
    $danger ? "var(--text-danger, #ef4444)" : "var(--text-secondary, #333d4b)"};
  white-space: nowrap;
  transition: background-color 0.15s ease;

  &:hover {
    background-color: var(--bg-subtle, #f8f9fb);
  }

  &:active {
    background-color: var(--bg-subtle, #f8f9fb);
  }
`;
