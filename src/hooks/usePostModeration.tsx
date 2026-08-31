import { ReactNode, useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import PostModerationMenu from "@/components/mobile/moderation/PostModerationMenu";
import ReportModal, {
  ReportTarget,
} from "@/components/mobile/moderation/ReportModal";
import BlockUserModal, {
  BlockTarget,
} from "@/components/mobile/moderation/BlockUserModal";
import useHiddenContentStore from "@/stores/useHiddenContentStore";
import useUserStore from "@/stores/useUserStore";
import { ROUTES } from "@/constants/routes";

/**
 * 게시글 목록(피드)에 신고/차단/숨기기를 붙이는 공용 훅.
 *
 * App Store 가이드라인 1.2(UGC)는 신고·차단·"피드에서 즉시 숨기기" 세 가지를
 * 모두 요구한다. 이 로직이 화면마다 흩어지면 목록 하나만 빠져도 그대로 리젝
 * 사유가 되므로(#340이 실제로 라우팅되지 않는 MobileBoardPage에만 붙어 리젝됐다),
 * 목록을 렌더하는 화면은 전부 이 훅을 통해 붙인다.
 *
 * 사용법:
 *   const moderation = usePostModeration();
 *   const visible = moderation.filterHidden(posts);
 *   ... <PostItem menuSlot={moderation.renderMenu(post)} /> ...
 *   {moderation.modals}
 */

interface ModeratablePost {
  id: number;
  writer?: string;
}

export interface PostModeration {
  /** 숨김/신고/차단 처리된 게시글을 제거한 목록 */
  filterHidden: <T extends { id: number }>(posts: T[]) => T[];
  /** PostItem의 menuSlot / TipsCard의 menuSlot에 그대로 넣는다 */
  renderMenu: (post: ModeratablePost) => ReactNode;
  /** 화면 어딘가에 한 번 렌더해야 신고/차단 모달이 동작한다 */
  modals: ReactNode;
  /** 목록 밖(상세 헤더 등)에서 직접 부를 때 */
  reportPost: (postId: number) => void;
  blockWriter: (postId: number, nickname: string) => void;
  hidePost: (postId: number) => void;
}

export default function usePostModeration(): PostModeration {
  const navigate = useNavigate();
  const [reportTarget, setReportTarget] = useState<ReportTarget | null>(null);
  const [blockTarget, setBlockTarget] = useState<BlockTarget | null>(null);

  const hiddenPostIds = useHiddenContentStore((state) => state.postIds);
  const hidePost = useHiddenContentStore((state) => state.hidePost);
  const { tokenInfo } = useUserStore();
  const isLoggedIn = Boolean(tokenInfo.accessToken);

  const requireLogin = useCallback(() => {
    if (isLoggedIn) return true;
    if (window.confirm("로그인이 필요해요. 로그인 페이지로 이동할까요?")) {
      navigate(ROUTES.LOGIN);
    }
    return false;
  }, [isLoggedIn, navigate]);

  const reportPost = useCallback(
    (postId: number) => {
      if (!requireLogin()) return;
      setReportTarget({ type: "POST", postId });
    },
    [requireLogin],
  );

  const blockWriter = useCallback(
    (postId: number, nickname: string) => {
      if (!requireLogin()) return;
      setBlockTarget({ postId, nickname });
    },
    [requireLogin],
  );

  const filterHidden = useCallback(
    <T extends { id: number }>(posts: T[]) =>
      posts.filter((post) => !hiddenPostIds.includes(post.id)),
    [hiddenPostIds],
  );

  const renderMenu = useCallback(
    (post: ModeratablePost) => (
      <PostModerationMenu
        postId={post.id}
        writer={post.writer}
        onReport={reportPost}
        onBlock={blockWriter}
      />
    ),
    [reportPost, blockWriter],
  );

  const modals = useMemo(
    () => (
      <>
        <ReportModal
          target={reportTarget}
          onClose={() => setReportTarget(null)}
        />
        <BlockUserModal
          target={blockTarget}
          onClose={() => setBlockTarget(null)}
          onBlocked={() => {
            // 차단 즉시 그 글이 목록에서 사라져야 한다. 응답에 memberId가 없어
            // (src/apis/blocks.ts 참고) 같은 작성자의 다른 글까지는 클라이언트가
            // 특정할 수 없으므로, 차단 대상이었던 글만 숨김 목록에 넣는다.
            // 나머지는 다음 조회부터 서버가 걸러 내려준다.
            if (blockTarget && "postId" in blockTarget) {
              hidePost(blockTarget.postId);
            }
          }}
        />
      </>
    ),
    [reportTarget, blockTarget, hidePost],
  );

  return {
    filterHidden,
    renderMenu,
    modals,
    reportPost,
    blockWriter,
    hidePost,
  };
}
