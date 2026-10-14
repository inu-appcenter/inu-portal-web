import styled from "styled-components";
import BottomSheet from "@/components/common/BottomSheet";
import { typography } from "@/styles/typography";
import SendTargetPicker from "./SendTargetPicker";
import type { PollShareKind, SharePollResponse } from "@/types/schedulePolls";

interface SendTargetSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  pollId: number;
  linkUrl: string;
  shareText: string;
  kind: PollShareKind;
  resultVersion?: number;
  candidateRank?: number;
  preselectedRoomIds?: number[];
  onSent: (response: SharePollResponse) => void;
  onStale?: () => void;
}

/** 보낼 곳 선택 시트. 참여 현황의 '초대하기'와 결과의 '채팅방에 공유하기'에서 연다. */
const SendTargetSheet = ({
  open,
  onOpenChange,
  title,
  ...pickerProps
}: SendTargetSheetProps) => (
  <BottomSheet
    open={open}
    onOpenChange={onOpenChange}
    height="88%"
    handle="compact"
    repositionInputs
  >
    <Title>{title}</Title>
    {/* 시트를 열 때마다 선택·검색 상태를 새로 시작한다 */}
    {open && (
      <SendTargetPicker
        {...pickerProps}
        renderFooter={(buttons) => <Footer>{buttons}</Footer>}
      />
    )}
  </BottomSheet>
);

export default SendTargetSheet;

const Title = styled.h2`
  margin: 4px 4px 12px;
  color: var(--text-primary);
  ${typography.title2}
`;

const Footer = styled.div`
  position: sticky;
  bottom: 0;
  display: flex;
  gap: 12px;
  padding: 12px 0 0;
  background: var(--bg-base);
`;
