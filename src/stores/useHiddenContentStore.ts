import { create } from "zustand";
import { safeLocalStorage } from "@/utils/safeStorage";

/**
 * 신고/차단한 콘텐츠를 즉시 숨기기 위한 로컬 상태.
 *
 * App Store 가이드라인 1.2(UGC)는 "사용자가 불쾌한 콘텐츠를 피드에서 즉시
 * 숨길 수 있어야 한다"고 요구한다. 서버의 신고 처리(24시간 이내 검토)는
 * 비동기이므로, 신고한 사용자 본인 화면에서는 즉시 사라지도록 클라이언트에
 * 숨김 목록을 보관한다. 목록은 기기별로 유지된다.
 *
 * 게시글(postIds) · 댓글(replyIds)뿐 아니라 채팅 메시지(messageIds)도 숨긴다 —
 * 채팅도 동일하게 사용자 제작 콘텐츠이고, 심사에서 같은 기준으로 본다.
 */

const STORAGE_KEY = "hiddenContent";

interface HiddenContentSnapshot {
  postIds: number[];
  replyIds: number[];
  /** 채팅 messageId는 서버에서 문자열 UUID로 내려온다. */
  messageIds: string[];
}

interface HiddenContentState extends HiddenContentSnapshot {
  hidePost: (postId: number) => void;
  hideReply: (replyId: number) => void;
  hideMessage: (messageId: string) => void;
  unhidePost: (postId: number) => void;
  clearHidden: () => void;
}

const EMPTY: HiddenContentSnapshot = {
  postIds: [],
  replyIds: [],
  messageIds: [],
};

function readSnapshot(): HiddenContentSnapshot {
  const stored = safeLocalStorage.getItem(STORAGE_KEY);
  if (!stored) return EMPTY;

  try {
    const parsed = JSON.parse(stored) as Partial<HiddenContentSnapshot>;
    return {
      postIds: Array.isArray(parsed.postIds) ? parsed.postIds : [],
      replyIds: Array.isArray(parsed.replyIds) ? parsed.replyIds : [],
      // messageIds는 나중에 추가된 필드라 기존 기기의 스냅샷에는 없다.
      messageIds: Array.isArray(parsed.messageIds) ? parsed.messageIds : [],
    };
  } catch {
    return EMPTY;
  }
}

function writeSnapshot(snapshot: HiddenContentSnapshot): void {
  safeLocalStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
}

const useHiddenContentStore = create<HiddenContentState>((set, get) => ({
  ...readSnapshot(),

  hidePost: (postId) => {
    if (get().postIds.includes(postId)) return;

    const { replyIds, messageIds } = get();
    const next = { postIds: [...get().postIds, postId], replyIds, messageIds };
    writeSnapshot(next);
    set(next);
  },

  hideReply: (replyId) => {
    if (get().replyIds.includes(replyId)) return;

    const { postIds, messageIds } = get();
    const next = { postIds, replyIds: [...get().replyIds, replyId], messageIds };
    writeSnapshot(next);
    set(next);
  },

  hideMessage: (messageId) => {
    if (!messageId || get().messageIds.includes(messageId)) return;

    const { postIds, replyIds } = get();
    const next = {
      postIds,
      replyIds,
      messageIds: [...get().messageIds, messageId],
    };
    writeSnapshot(next);
    set(next);
  },

  unhidePost: (postId) => {
    const { replyIds, messageIds } = get();
    const next = {
      postIds: get().postIds.filter((id) => id !== postId),
      replyIds,
      messageIds,
    };
    writeSnapshot(next);
    set(next);
  },

  clearHidden: () => {
    writeSnapshot(EMPTY);
    set(EMPTY);
  },
}));

export default useHiddenContentStore;
