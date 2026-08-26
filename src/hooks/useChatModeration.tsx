import { ReactNode, useCallback, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import Modal from "@/components/common/Modal";
import ChatModerationSheet from "@/components/mobile/moderation/ChatModerationSheet";
import ChatReportModal, {
  ChatReportTarget,
} from "@/components/mobile/moderation/ChatReportModal";
import useHiddenContentStore from "@/stores/useHiddenContentStore";
import { getChatRoomMemberProfile } from "@/apis/chat";
import { blockUser } from "@/apis/blocks";

/**
 * 채팅 메시지에 신고/차단/숨기기를 붙이는 훅.
 *
 * 채팅은 게시글·댓글과 동일한 사용자 제작 콘텐츠이므로 App Store 가이드라인
 * 1.2가 요구하는 세 가지를 모두 제공해야 한다. 메시지를 길게 누르면 시트가
 * 열리고, 어떤 동작을 하든 그 메시지는 내 화면에서 즉시 사라진다.
 */

export interface ChatModerationTarget {
  roomId: string;
  messageId: string;
  senderNickname: string;
  senderChatRoomMemberId: number;
  content: string;
  isMine: boolean;
}

export interface ChatModeration {
  /** 숨김/신고/차단 처리한 메시지를 제거한 목록 */
  filterHidden: <T extends { messageId: string }>(messages: T[]) => T[];
  /** 메시지 롱프레스 핸들러에서 부른다 */
  openFor: (target: ChatModerationTarget) => void;
  /**
   * 채팅방 헤더 메뉴에서 부른다. 롱프레스만으로는 심사자가 신고 수단을 못 찾을 수
   * 있어(실제로 1.2 리젝 사유가 됐다) 항상 보이는 진입점을 하나 더 둔다.
   */
  openRoomReport: (roomId: string, roomTitle: string) => void;
  /** 화면 어딘가에 한 번 렌더해야 시트/모달이 동작한다 */
  sheets: ReactNode;
}

export default function useChatModeration(): ChatModeration {
  const queryClient = useQueryClient();
  const [sheetTarget, setSheetTarget] = useState<ChatModerationTarget | null>(
    null,
  );
  const [reportTarget, setReportTarget] = useState<ChatReportTarget | null>(
    null,
  );
  const [blockTarget, setBlockTarget] = useState<ChatModerationTarget | null>(
    null,
  );
  const [isBlocking, setIsBlocking] = useState(false);

  const hiddenMessageIds = useHiddenContentStore((state) => state.messageIds);
  const hideMessage = useHiddenContentStore((state) => state.hideMessage);

  const filterHidden = useCallback(
    <T extends { messageId: string }>(messages: T[]) =>
      messages.filter((message) => !hiddenMessageIds.includes(message.messageId)),
    [hiddenMessageIds],
  );

  const openFor = useCallback((target: ChatModerationTarget) => {
    setSheetTarget(target);
  }, []);

  const openRoomReport = useCallback((roomId: string, roomTitle: string) => {
    setReportTarget({ roomId, senderNickname: roomTitle, content: "" });
  }, []);

  const handleBlock = useCallback(async () => {
    if (!blockTarget || isBlocking) return;

    setIsBlocking(true);
    try {
      // 메시지에는 방 단위 식별자(senderChatRoomMemberId)만 실려 온다.
      // 차단은 회원 단위라 프로필 조회로 memberId를 먼저 얻어야 한다.
      const profile = await getChatRoomMemberProfile(
        blockTarget.roomId,
        blockTarget.senderChatRoomMemberId,
      );
      const memberId = profile.data?.memberId;
      if (!memberId) {
        alert("차단 대상을 확인할 수 없습니다. 잠시 후 다시 시도해주세요.");
        return;
      }

      await blockUser(memberId);
      hideMessage(blockTarget.messageId);
      queryClient.invalidateQueries({ queryKey: ["blockedUsers"] });
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      alert(
        "차단했습니다.\n차단한 사용자의 메시지와 게시글은 더 이상 보이지 않습니다.",
      );
      setBlockTarget(null);
    } catch (error) {
      console.error("채팅 사용자 차단 실패", error);
      const message = (error as { response?: { data?: { msg?: string } } })
        ?.response?.data?.msg;
      alert(message || "차단에 실패했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setIsBlocking(false);
    }
  }, [blockTarget, isBlocking, hideMessage, queryClient]);

  const sheets = useMemo(
    () => (
      <>
        <ChatModerationSheet
          open={Boolean(sheetTarget)}
          onOpenChange={(open) => {
            if (!open) setSheetTarget(null);
          }}
          senderNickname={sheetTarget?.senderNickname ?? ""}
          isMine={sheetTarget?.isMine ?? false}
          onHide={() => {
            if (sheetTarget) hideMessage(sheetTarget.messageId);
          }}
          onReport={() => {
            if (!sheetTarget) return;
            setReportTarget({
              roomId: sheetTarget.roomId,
              messageId: sheetTarget.messageId,
              senderNickname: sheetTarget.senderNickname,
              content: sheetTarget.content,
            });
          }}
          onBlock={() => setBlockTarget(sheetTarget)}
        />

        <ChatReportModal
          target={reportTarget}
          onClose={() => setReportTarget(null)}
        />

        <Modal
          isOpen={Boolean(blockTarget)}
          onClose={() => setBlockTarget(null)}
          title={
            blockTarget
              ? `'${blockTarget.senderNickname}'님을 차단할까요?`
              : "사용자 차단"
          }
          description={
            "차단하면 이 사용자의 메시지와 게시글이 보이지 않습니다.\n차단 해제는 마이페이지 > 차단 사용자 관리에서 할 수 있어요."
          }
          primaryButton={{
            text: "차단하기",
            onClick: handleBlock,
            variant: "danger",
            disabled: isBlocking,
            loading: isBlocking,
          }}
          secondaryButton={{
            text: "취소",
            onClick: () => setBlockTarget(null),
          }}
        />
      </>
    ),
    [sheetTarget, reportTarget, blockTarget, isBlocking, hideMessage, handleBlock],
  );

  return { filterHidden, openFor, openRoomReport, sheets };
}
