import { useMutation, useQueryClient } from "@tanstack/react-query";
import Modal from "@/components/common/Modal";
import { blockPostAuthor, blockReplyAuthor } from "@/apis/blocks";

// postId/replyId 기준으로만 차단한다 — PostResponseDto/ReplyResponseDto가
// memberId를 내려주지 않아(익명 글/댓글 재식별 방지) 클라이언트는 애초에
// memberId를 알 수 없다. 서버가 postId/replyId로 작성자를 찾아 차단한다.
export type BlockTarget =
  | { postId: number; nickname: string }
  | { replyId: number; nickname: string };

interface BlockUserModalProps {
  /** null 이면 닫힌 상태 */
  target: BlockTarget | null;
  onClose: () => void;
  /** 차단 성공 후 호출. target이 post였는지 reply였는지는 호출부가 target으로 직접 판단한다. */
  onBlocked?: () => void;
}

export default function BlockUserModal({
  target,
  onClose,
  onBlocked,
}: BlockUserModalProps) {
  const queryClient = useQueryClient();

  const blockMutation = useMutation({
    mutationFn: (t: BlockTarget) =>
      "postId" in t ? blockPostAuthor(t.postId) : blockReplyAuthor(t.replyId),
    onSuccess: () => {
      alert(
        "차단했습니다.\n차단한 사용자의 글과 댓글은 더 이상 보이지 않습니다.",
      );
      queryClient.invalidateQueries({ queryKey: ["blockedUsers"] });
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      onClose();
      onBlocked?.();
    },
    onError: (error: unknown) => {
      console.error("유저 차단 실패", error);
      const message = (
        error as { response?: { data?: { msg?: string } } }
      )?.response?.data?.msg;
      alert(message || "차단에 실패했습니다. 잠시 후 다시 시도해주세요.");
    },
  });

  return (
    <Modal
      isOpen={Boolean(target)}
      onClose={onClose}
      title={target ? `'${target.nickname}'님을 차단할까요?` : "사용자 차단"}
      description={
        "차단하면 이 사용자의 게시글과 댓글이 보이지 않습니다.\n차단 해제는 마이페이지 > 차단 사용자 관리에서 할 수 있어요."
      }
      primaryButton={{
        text: "차단하기",
        onClick: () => target && blockMutation.mutate(target),
        variant: "danger",
        disabled: !target || blockMutation.isPending,
        loading: blockMutation.isPending,
      }}
      secondaryButton={{ text: "취소", onClick: onClose }}
    />
  );
}
