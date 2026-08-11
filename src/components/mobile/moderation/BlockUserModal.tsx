import { useMutation, useQueryClient } from "@tanstack/react-query";
import Modal from "@/components/common/Modal";
import { blockUser } from "@/apis/blocks";

export interface BlockTarget {
  memberId: number;
  nickname: string;
}

interface BlockUserModalProps {
  /** null 이면 닫힌 상태 */
  target: BlockTarget | null;
  onClose: () => void;
  /** 차단 성공 후 차단된 memberId와 함께 호출 (목록/상세 새로고침 등) */
  onBlocked?: (blockedMemberId: number) => void;
}

export default function BlockUserModal({
  target,
  onClose,
  onBlocked,
}: BlockUserModalProps) {
  const queryClient = useQueryClient();

  const blockMutation = useMutation({
    mutationFn: (targetMemberId: number) => blockUser(targetMemberId),
    onSuccess: (_data, blockedMemberId) => {
      alert(
        "차단했습니다.\n차단한 사용자의 글과 댓글은 더 이상 보이지 않습니다.",
      );
      queryClient.invalidateQueries({ queryKey: ["blockedUsers"] });
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      onClose();
      onBlocked?.(blockedMemberId);
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
        onClick: () => target && blockMutation.mutate(target.memberId),
        variant: "danger",
        disabled: !target || blockMutation.isPending,
        loading: blockMutation.isPending,
      }}
      secondaryButton={{ text: "취소", onClick: onClose }}
    />
  );
}
