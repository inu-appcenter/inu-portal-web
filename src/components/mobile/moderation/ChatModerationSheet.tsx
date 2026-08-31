import styled from "styled-components";
import { Ban, Siren } from "lucide-react";
import Icon from "@/components/common/Icon";
import BottomSheet from "@/components/common/BottomSheet";

/**
 * 채팅 메시지 하나에 대한 신고/차단/숨기기 액션 시트.
 *
 * 채팅도 게시글·댓글과 같은 사용자 제작 콘텐츠라, App Store 가이드라인 1.2가
 * 요구하는 세 가지(신고 · 사용자 차단 · 즉시 숨김)를 동일하게 제공해야 한다.
 * 메시지를 길게 누르면 열린다.
 */

interface ChatModerationSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  senderNickname: string;
  /** 내가 보낸 메시지면 신고/차단 대신 숨기기만 노출한다. */
  isMine: boolean;
  onReport: () => void;
  onBlock: () => void;
  onHide: () => void;
}

export default function ChatModerationSheet({
  open,
  onOpenChange,
  senderNickname,
  isMine,
  onReport,
  onBlock,
  onHide,
}: ChatModerationSheetProps) {
  const run = (action: () => void) => {
    onOpenChange(false);
    action();
  };

  return (
    <BottomSheet open={open} onOpenChange={onOpenChange}>
      <SheetBody>
        <SheetTitle>메시지 관리</SheetTitle>

        <ActionItem type="button" onClick={() => run(onHide)}>
          <Icon name="eye-off" size={20} color="var(--gray-700, #4e5968)" />
          <ActionLabelGroup>
            <ActionLabel>이 메시지 숨기기</ActionLabel>
            <ActionHint>내 화면에서 즉시 사라집니다</ActionHint>
          </ActionLabelGroup>
        </ActionItem>

        {!isMine && (
          <>
            <ActionItem type="button" $danger onClick={() => run(onReport)}>
              <Siren size={20} color="var(--text-danger, #f04452)" />
              <ActionLabelGroup>
                <ActionLabel $danger>신고하기</ActionLabel>
                <ActionHint>운영자가 24시간 이내에 검토합니다</ActionHint>
              </ActionLabelGroup>
            </ActionItem>

            <ActionItem type="button" $danger onClick={() => run(onBlock)}>
              <Ban size={20} color="var(--text-danger, #f04452)" />
              <ActionLabelGroup>
                <ActionLabel $danger>
                  {senderNickname
                    ? `'${senderNickname}'님 차단하기`
                    : "이 사용자 차단하기"}
                </ActionLabel>
                <ActionHint>이 사용자의 메시지와 글이 보이지 않습니다</ActionHint>
              </ActionLabelGroup>
            </ActionItem>
          </>
        )}

        <CancelButton type="button" onClick={() => onOpenChange(false)}>
          취소
        </CancelButton>
      </SheetBody>
    </BottomSheet>
  );
}

const SheetBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 8px 16px calc(16px + env(safe-area-inset-bottom));
`;

const SheetTitle = styled.div`
  padding: 8px 4px 12px;
  font-family: Pretendard, sans-serif;
  font-size: 15px;
  font-weight: 700;
  color: var(--text-primary, #191f28);
`;

const ActionItem = styled.button<{ $danger?: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 14px 4px;
  border: 0;
  background: transparent;
  text-align: left;
  cursor: pointer;

  &:active {
    background: var(--bg-subtle, #f8f9fb);
  }
`;

const ActionLabelGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const ActionLabel = styled.span<{ $danger?: boolean }>`
  font-family: Pretendard, sans-serif;
  font-size: 15px;
  font-weight: 600;
  color: ${({ $danger }) =>
    $danger ? "var(--text-danger, #f04452)" : "var(--text-primary, #191f28)"};
`;

const ActionHint = styled.span`
  font-family: Pretendard, sans-serif;
  font-size: 12px;
  color: var(--gray-500, #8b95a1);
`;

const CancelButton = styled.button`
  margin-top: 8px;
  padding: 14px;
  border: 0;
  border-radius: 14px;
  background: var(--bg-subtle, #f8f9fb);
  font-family: Pretendard, sans-serif;
  font-size: 15px;
  font-weight: 600;
  color: var(--gray-700, #4e5968);
  cursor: pointer;
`;
