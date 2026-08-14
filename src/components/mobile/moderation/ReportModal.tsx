import { useEffect, useState } from "react";
import styled from "styled-components";
import axios, { AxiosError } from "axios";
import Modal from "@/components/common/Modal";
import { postReplyReport, postReports } from "@/apis/reports";
import { reportsReasons } from "@/resources/strings/reportsReasons";

export type ReportTarget =
  | { type: "POST"; postId: number }
  | { type: "REPLY"; postId: number; replyId: number };

interface ReportModalProps {
  /** null 이면 닫힌 상태 */
  target: ReportTarget | null;
  onClose: () => void;
}

export default function ReportModal({ target, onClose }: ReportModalProps) {
  const [selectedReason, setSelectedReason] = useState("");
  const [detail, setDetail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 대상이 바뀔 때마다 입력값 초기화
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
      if (target.type === "REPLY") {
        await postReplyReport(
          target.postId,
          target.replyId,
          selectedReason,
          detail,
        );
      } else {
        await postReports(target.postId, selectedReason, detail.trim());
      }
      alert(
        "신고가 접수되었습니다.\n운영자가 24시간 이내에 검토 후 조치할 예정이에요.",
      );
      onClose();
    } catch (error) {
      console.error("신고하기 실패", error);
      if (
        axios.isAxiosError(error) &&
        !(error as AxiosError & { isRefreshError?: boolean }).isRefreshError &&
        error.response
      ) {
        switch (error.response.status) {
          case 401:
          case 403:
            alert("로그인 후 신고할 수 있습니다.");
            break;
          case 404:
            alert("이미 삭제되었거나 존재하지 않는 게시물입니다.");
            break;
          case 409:
            alert("이미 신고한 게시물입니다.");
            break;
          default:
            alert("신고 접수에 실패했습니다. 잠시 후 다시 시도해주세요.");
            break;
        }
      } else {
        alert("신고 접수에 실패했습니다. 잠시 후 다시 시도해주세요.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={Boolean(target)}
      onClose={onClose}
      title={target?.type === "REPLY" ? "댓글 신고하기" : "게시글 신고하기"}
      description={
        "접수된 신고는 운영자가 24시간 이내에 검토합니다.\n규정 위반이 확인되면 게시물이 삭제되고 작성자의 이용이 제한됩니다."
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
      $selected ? "var(--border-brand, #0061ff)" : "var(--border-default, #e5e8eb)"};
  background-color: ${({ $selected }) =>
    $selected ? "var(--bg-brand, #eff6ff)" : "var(--bg-base, #ffffff)"};
  color: ${({ $selected }) =>
    $selected ? "var(--text-brand, #0061ff)" : "var(--gray-800, #333d4b)"};
  font-weight: ${({ $selected }) => ($selected ? 600 : 400)};
`;

const DetailInput = styled.textarea`
  width: 100%;
  min-height: 72px;
  padding: 10px 12px;
  box-sizing: border-box;
  border-radius: 12px;
  border: 1px solid var(--border-default, #e5e8eb);
  background-color: var(--bg-base, #ffffff);
  font-family: Pretendard, sans-serif;
  font-size: 14px;
  line-height: 1.5;
  color: var(--gray-800, #333d4b);
  resize: none;
  outline: none;

  &::placeholder {
    color: var(--text-tertiary, #8b95a1);
  }

  &:focus {
    border-color: var(--border-brand, #0061ff);
  }
`;
