import styled from "styled-components";
import { useEffect, useMemo, useState } from "react";
import { deletePost, getPostDetail } from "@/apis/posts";
import PostContentContainer from "@/containers/mobile/postdetail/PostContentContainer";
import CommentListMobile from "@/containers/mobile/postdetail/CommentListContainer";
import ReplyInput from "@/containers/mobile/postdetail/ReplyInput";
import { PostDetail, Reply } from "@/types/posts";
import axios, { AxiosError } from "axios";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useHeader } from "@/context/HeaderContext";
import ReplyPortal from "@/components/common/ReplyPortal";
import { mixpanelTrack } from "@/utils/mixpanel";
import Skeleton from "@/components/common/Skeleton";
import ReportModal, {
  ReportTarget,
} from "@/components/mobile/moderation/ReportModal";
import BlockUserModal, {
  BlockTarget,
} from "@/components/mobile/moderation/BlockUserModal";
import useUserStore from "@/stores/useUserStore";
import { ROUTES } from "@/constants/routes";
import { useQueryClient } from "@tanstack/react-query";

const PostDetailSkeleton = () => (
  <PostWrapper>
    <SkeletonHeaderContainer>
      <Skeleton width="85%" height={28} />
      <SkeletonAuthorRow>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Skeleton circle width={36} height={36} />
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <Skeleton width={90} height={16} />
            <Skeleton width={60} height={12} />
          </div>
        </div>
      </SkeletonAuthorRow>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 16 }}>
        <Skeleton width="100%" height={18} />
        <Skeleton width="92%" height={18} />
        <Skeleton width="65%" height={18} />
      </div>
    </SkeletonHeaderContainer>
    <CommentWrapper>
      <SkeletonCommentSection>
        <div style={{ padding: "16px 16px 40px", display: "flex", flexDirection: "column", gap: 16 }}>
          <Skeleton width={80} height={18} />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              <Skeleton circle width={36} height={36} />
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                <Skeleton width={80} height={14} />
                <Skeleton width="90%" height={16} />
              </div>
            </div>
          ))}
        </div>
      </SkeletonCommentSection>
    </CommentWrapper>
  </PostWrapper>
);

export default function PostDetailPage() {
  const queryClient = useQueryClient();
  const [post, setPost] = useState<PostDetail>();
  const [commentUpdated, setCommentUpdated] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [replyContent, setReplyContent] = useState("");
  const [replyToEdit, setReplyToEdit] = useState<Reply | null>(null);
  const [replyToReply, setReplyToReply] = useState<Reply | null>(null);
  const [reportTarget, setReportTarget] = useState<ReportTarget | null>(null);
  const [blockTarget, setBlockTarget] = useState<BlockTarget | null>(null);

  const cancelEditOrReply = () => {
    setReplyToEdit(null);
    setReplyToReply(null);
    setReplyContent("");
  };

  const navigate = useNavigate();
  const { tokenInfo } = useUserStore();
  const isLoggedIn = Boolean(tokenInfo.accessToken);
  const { id: paramId, postId } = useParams<{ id?: string; postId?: string }>();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const queryId = searchParams.get("id");
  const targetId = paramId || postId || queryId;
  const id = Number(targetId);

  const fetchPost = async (targetPostId: number) => {
    try {
      const response = await getPostDetail(targetPostId);
      console.log("게시글 가져오기 성공!!!");
      setPost(response.data);

      mixpanelTrack.tipViewed(response.data.category, response.data.title);
    } catch (error) {
      console.error("게시글 가져오기 실패", error);
    }
  };

  useEffect(() => {
    if (id && !isNaN(id)) {
      fetchPost(id);
    }
  }, [id]);

  useEffect(() => {
    if (commentUpdated && id && !isNaN(id)) {
      fetchPost(id);
      setCommentUpdated(false);
    }
  }, [commentUpdated, id]);

  const handleDeletePost = async () => {
    if (!post) return;
    if (window.confirm("정말 게시글을 삭제하시겠습니까?")) {
      try {
        await deletePost(post.id);
        await queryClient.invalidateQueries({ queryKey: ["posts"] });
        alert("게시글이 삭제되었습니다.");
        navigate(-1);
      } catch (error) {
        console.error("게시글 삭제 실패", error);
        if (
          axios.isAxiosError(error) &&
          !(error as AxiosError & { isRefreshError?: boolean }).isRefreshError &&
          error.response
        ) {
          const status = error.response.status;
          if (status === 403) {
            alert("해당 게시글을 삭제할 권한이 없습니다.");
          } else if (status === 404) {
            alert("존재하지 않는 회원 또는 게시글입니다.");
          } else {
            alert("게시글 삭제 중 오류가 발생했습니다.");
          }
        }
      }
    }
  };

  // 로그인이 필요한 동작(신고/차단) 앞에서 호출한다.
  const requireLogin = () => {
    if (isLoggedIn) return true;
    if (window.confirm("로그인이 필요해요. 로그인 페이지로 이동할까요?")) {
      navigate(ROUTES.LOGIN);
    }
    return false;
  };

  const handleReportPost = () => {
    if (!post || !requireLogin()) return;
    setReportTarget({ type: "POST", postId: post.id });
  };

  const handleReportReply = (reply: Reply) => {
    if (!post || !requireLogin()) return;
    setReportTarget({ type: "REPLY", postId: post.id, replyId: reply.id });
  };

  const handleBlockPostAuthor = (postId: number, nickname: string) => {
    if (!requireLogin()) return;
    setBlockTarget({ postId, nickname });
  };

  const handleBlockReplyAuthor = (replyId: number, nickname: string) => {
    if (!requireLogin()) return;
    setBlockTarget({ replyId, nickname });
  };

  const headerMenu = useMemo(() => {
    if (!post) return undefined;

    if (post.hasAuthority) {
      return [
        {
          label: "수정하기",
          onClick: () => navigate(ROUTES.BOARD.TIPS_EDIT(post.id)),
        },
        {
          label: "삭제하기",
          onClick: handleDeletePost,
        },
      ];
    }

    const menu = [
      {
        label: "신고하기",
        onClick: handleReportPost,
      },
    ];

    // postId만으로 서버가 작성자를 찾아 차단하므로(#294) 익명 글도 차단 가능하다.
    menu.push({
      label: "작성자 차단하기",
      onClick: () => handleBlockPostAuthor(post.id, post.writer || "작성자"),
    });

    return menu;
  }, [post, navigate, isLoggedIn]);

  useHeader({
    title: post ? post.category || "게시글 상세" : "게시글 상세",
    hasback: true,
    menuItems: headerMenu,
  });

  return (
    <Wrapper>
      {post ? (
        <>
          <PostWrapper>
            <PostContentContainer ClubRecruit={post} />
            <CommentWrapper>
              <CommentListMobile
                postId={post.id}
                like={post.like}
                isLiked={post.isLiked}
                scrap={post.scrap}
                isScraped={post.isScraped}
                title={post.title}
                bestReply={post.bestReplies[0]}
                replies={post.replies}
                setReplyToReply={setReplyToReply}
                setReplyToEdit={setReplyToEdit}
                setReplyContent={setReplyContent}
                onCommentUpdate={() => setCommentUpdated(true)}
                onReportReply={handleReportReply}
                onBlockWriter={handleBlockReplyAuthor}
              />
            </CommentWrapper>
          </PostWrapper>
          <ReplyPortal>
            <ReplyInput
              postId={post.id}
              replyContent={replyContent}
              isAnonymous={isAnonymous}
              replyToEdit={replyToEdit}
              replyToReply={replyToReply}
              setReplyToReply={setReplyToReply}
              setReplyToEdit={setReplyToEdit}
              setReplyContent={setReplyContent}
              setIsAnonymous={setIsAnonymous}
              cancelEditOrReply={cancelEditOrReply}
              onCommentUpdate={() => setCommentUpdated(true)}
            />
          </ReplyPortal>
          <ReportModal
            target={reportTarget}
            onClose={() => setReportTarget(null)}
          />
          <BlockUserModal
            target={blockTarget}
            onClose={() => setBlockTarget(null)}
            onBlocked={() => {
              // 차단 직후 해당 작성자의 글/댓글이 더 이상 보이지 않아야 한다.
              // 글쓴이를 차단했다면 이 상세 페이지 자체를 벗어나고,
              // 댓글 작성자를 차단했다면 목록만 다시 불러온다. blockTarget이
              // postId/replyId 중 무엇이었는지로 직접 판단한다(응답에 값이 없다).
              if (blockTarget && "postId" in blockTarget) {
                navigate(-1);
              } else {
                setCommentUpdated(true);
              }
            }}
          />
        </>
      ) : (
        <PostDetailSkeleton />
      )}
    </Wrapper>
  );
}

const Wrapper = styled.div`
  width: 100%;
  min-height: calc(100vh - 56px);
  display: flex;
  flex-direction: column;
  background-color: var(--bg-subtle, #f8f9fb);
  box-sizing: border-box;
`;

const PostWrapper = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  position: relative;
  z-index: 1;
`;

const CommentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  position: relative;
`;

const SkeletonHeaderContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 24px 16px 28px;
  width: 100%;
  box-sizing: border-box;
`;

const SkeletonAuthorRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
`;

const SkeletonCommentSection = styled.div`
  background: var(--bg-base, #ffffff);
  border-top-left-radius: 24px;
  border-top-right-radius: 24px;
  box-shadow: 0px -2px 8px 0px rgba(0, 0, 0, 0.04);
  flex: 1;
  width: 100%;
  box-sizing: border-box;
`;
