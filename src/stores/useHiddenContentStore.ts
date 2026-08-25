import { create } from "zustand";
import { safeLocalStorage } from "@/utils/safeStorage";

/**
 * 신고/차단한 콘텐츠를 즉시 숨기기 위한 로컬 상태.
 *
 * App Store 가이드라인 1.2(UGC)는 "사용자가 불쾌한 콘텐츠를 피드에서 즉시
 * 숨길 수 있어야 한다"고 요구한다. 서버의 신고 처리(24시간 이내 검토)는
 * 비동기이므로, 신고한 사용자 본인 화면에서는 즉시 사라지도록 클라이언트에
 * 숨김 목록을 보관한다. 목록은 기기별로 유지된다.
 */

const STORAGE_KEY = "hiddenContent";

interface HiddenContentSnapshot {
  postIds: number[];
  replyIds: number[];
}

interface HiddenContentState extends HiddenContentSnapshot {
  hidePost: (postId: number) => void;
  hideReply: (replyId: number) => void;
  unhidePost: (postId: number) => void;
  clearHidden: () => void;
}

function readSnapshot(): HiddenContentSnapshot {
  const stored = safeLocalStorage.getItem(STORAGE_KEY);
  if (!stored) return { postIds: [], replyIds: [] };

  try {
    const parsed = JSON.parse(stored) as Partial<HiddenContentSnapshot>;
    return {
      postIds: Array.isArray(parsed.postIds) ? parsed.postIds : [],
      replyIds: Array.isArray(parsed.replyIds) ? parsed.replyIds : [],
    };
  } catch {
    return { postIds: [], replyIds: [] };
  }
}

function writeSnapshot(snapshot: HiddenContentSnapshot): void {
  safeLocalStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
}

const useHiddenContentStore = create<HiddenContentState>((set, get) => ({
  ...readSnapshot(),

  hidePost: (postId) => {
    if (get().postIds.includes(postId)) return;

    const next = { postIds: [...get().postIds, postId], replyIds: get().replyIds };
    writeSnapshot(next);
    set(next);
  },

  hideReply: (replyId) => {
    if (get().replyIds.includes(replyId)) return;

    const next = { postIds: get().postIds, replyIds: [...get().replyIds, replyId] };
    writeSnapshot(next);
    set(next);
  },

  unhidePost: (postId) => {
    const next = {
      postIds: get().postIds.filter((id) => id !== postId),
      replyIds: get().replyIds,
    };
    writeSnapshot(next);
    set(next);
  },

  clearHidden: () => {
    const next = { postIds: [], replyIds: [] };
    writeSnapshot(next);
    set(next);
  },
}));

export default useHiddenContentStore;
