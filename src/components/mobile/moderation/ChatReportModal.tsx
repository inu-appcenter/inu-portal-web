import { useEffect, useState } from "react";
import styled from "styled-components";
import Modal from "@/components/common/Modal";
import {
  ChatReportUnavailableError,
  buildChatReportFallbackUrl,
  reportChatMessage,
} from "@/apis/reports";
import { reportsReasons } from "@/resources/strings/reportsReasons";
import useHiddenContentStore from "@/stores/useHiddenContentStore";

export interface ChatReportTarget {
  roomId: string;
  /** 특정 메시지 신고. 채팅방 자체를 신고할 때는 비운다. */
  messageId?: string;
  senderNickname: string;
  content: string;
}

interface ChatReportModalProps {
  /** null 이면 닫힌 상태 */
  target: ChatReportTarget | null;
  onClose: () => void;
  onReported?: (target: ChatReportTarget) => void;
}

export default function ChatReportModal({
  target,
  onClose,
  onReported,
}: ChatReportModalProps) {
  const [selectedReason, setSelectedReason] = useState("");
  const [detail, setDetail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const hideMessage = useHiddenContentStore((state) => state.hideMessage);

  useEffect(() => {
    if (target) {
      setSelectedReason("");
      setDetail("");
    }
  }, [target]);

  const handleSubmit = async () => {
    if (!target || isSubmitting) return;
    if (!selectedReason) {
      alert("신고 사유를 선택해주세요.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (!target.messageId) {
        // 채팅방 자체 신고 — 대상 메시지가 없으니 곧장 문의 채널로 접수한다.
        throw new ChatReportUnavailableError();
      }
      await reportChatMessage(
        target.roomId,
        target.messageId,
        selectedReason,
        detail,
      );
      // 신고한 메시지는 검토 결과를 기다리지 않고 내 화면에서 즉시 사라진다.
      hideMessage(target.messageId);
      alert(
        "신고가 접수되었습니다.\n해당 메시지는 회원님의 화면에서 즉시 숨겨지며,\n운영자가 24시간 이내에 검토 후 조치할 예정이에요.",
      );
      onClose();
      onReported?.(target);
    } catch (error) {
      if (error instanceof ChatReportUnavailableError) {
        // 서버에 채팅 신고 엔드포인트가 아직 없다. 숨김은 그대로 적용하고,
        // 접수 자체는 문의 채널로 넘긴다(내용은 미리 채워진 상태).
        if (target.messageId) hideMessage(target.messageId);
        window.location.href = buildChatReportFallbackUrl({
          roomId: target.roomId,
          messageId: target.messageId ?? "(채팅방 전체 신고)",
          senderNickname: target.senderNickname,
          reason: selectedReason,
          comment: detail,
        });
        alert(
          target.messageId
            ? "해당 메시지는 회원님의 화면에서 즉시 숨겨졌습니다.\n신고 내용이 채워진 접수 메일이 열립니다.\n그대로 보내주시면 운영자가 24시간 이내에 검토합니다."
            : "신고 내용이 채워진 접수 메일이 열립니다.\n그대로 보내주시면 운영자가 24시간 이내에 검토합니다.",
        );
        onClose();
        onReported?.(target);
        return;
      }

      console.error("채팅 신고 실패", error);
      alert("신고 접수에 실패했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={Boolean(target)}
      onClose={onClose}
      title={target?.messageId ? "메시지 신고하기" : "채팅방 신고하기"}
      description={
        target?.messageId
          ? "신고하면 해당 메시지는 회원님의 화면에서 즉시 숨겨집니다.\n접수된 신고는 운영자가 24시간 이내에 검토하며,\n규정 위반이 확인되면 메시지가 삭제되고 작성자의 이용이 제한됩니다."
          : "접수된 신고는 운영자가 24시간 이내에 검토하며,\n규정 위반이 확인되면 해당 채팅방이 폐쇄되고\n작성자의 이용이 제한됩니다.\n\n특정 메시지를 신고하려면 그 메시지를 길게 눌러주세요."
      }
      primaryButton={{
        text: "신고 접수",
        onClick: handleSubmit,
        variant: "danger",
        disabled: !selectedReason || isSubmitting,
        loading: isSubmitting,
      }}
      secondaryButton={{ text: "취소", onClick: onClose }}
    >
      <FormArea>
        {target?.messageId && (
          <QuotedMessage>
            <QuotedSender>{target.senderNickname}</QuotedSender>
            <QuotedContent>{target.content || "(이미지 메시지)"}</QuotedContent>
          </QuotedMessage>
        )}
        <FieldLabel>신고 사유</FieldLabel>
        <ReasonList>
          {reportsReasons.map((reason) => (
            <ReasonItem
              key={reason}
              type="button"
              $selected={selectedReason === reason}
              onClick={() => setSelectedReason(reason)}
            >
              {reason}
            </ReasonItem>
          ))}
        </ReasonList>
        <DetailInput
          value={detail}
          onChange={(e) => setDetail(e.target.value)}
          placeholder="상세 내용을 입력해주세요. (선택)"
          maxLength={500}
        />
      </FormArea>
    </Modal>
  );
}

const FormArea = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 12px;
  width: 100%;
  text-align: left;
`;

const QuotedMessage = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 10px 12px;
  border-radius: 12px;
  background: var(--bg-subtle, #f8f9fb);
`;

const QuotedSender = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: var(--gray-600, #6b7684);
`;

const QuotedContent = styled.div`
  font-size: 14px;
  line-height: 1.4;
  color: var(--gray-800, #333d4b);
  word-break: break-all;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const FieldLabel = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: var(--gray-600, #6b7684);
`;

const ReasonList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
  max-height: 216px;
  overflow-y: auto;
`;

const ReasonItem = styled.button<{ $selected: boolean }>`
  width: 100%;
  padding: 10px 12px;
  border-radius: 12px;
  box-sizing: border-box;
  text-align: left;
  font-size: 14px;
  line-height: 1.4;
  word-break: keep-all;
  cursor: pointer;
  transition:
    border-color 0.15s ease,
    background-color 0.15s ease;
  border: 1px solid
    ${({ $selected }) =>
      $selected
        ? "var(--border-brand, #0061ff)"
        : "var(--border-default, #e5e8eb)"};
  background-color: ${({ $selected }) =>
    $selected ? "var(--bg-brand, #eff6ff)" : "var(--bg-base, #ffffff)"};
  color: ${({ $selected }) =>
    $selected ? "var(--text-brand, #0061ff)" : "var(--gray-800, #333d4b)"};
`;

const DetailInput = styled.textarea`
  width: 100%;
  min-height: 80px;
  padding: 10px 12px;
  box-sizing: border-box;
  border-radius: 12px;
  border: 1px solid var(--border-default, #e5e8eb);
  background: var(--bg-base, #ffffff);
  font-family: Pretendard, sans-serif;
  font-size: 14px;
  line-height: 1.4;
  resize: none;

  &::placeholder {
    color: var(--gray-500, #8b95a1);
  }
`;
