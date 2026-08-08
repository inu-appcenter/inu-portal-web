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
import UserProfileModal from "@/components/mobile/social/UserProfileModal";
import Skeleton from "@/components/common/Skeleton";
import { ROUTES } from "@/constants/routes";

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
  const [post, setPost] = useState<PostDetail>();
  const [commentUpdated, setCommentUpdated] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [replyContent, setReplyContent] = useState("");
  const [replyToEdit, setReplyToEdit] = useState<Reply | null>(null);
  const [replyToReply, setReplyToReply] = useState<Reply | null>(null);
  const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const cancelEditOrReply = () => {
    setReplyToEdit(null);
    setReplyToReply(null);
    setReplyContent("");
  };

  const navigate = useNavigate();
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

  const headerMenu = useMemo(() => {
    if (post?.hasAuthority) {
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
    return undefined;
  }, [post, navigate]);

  useHeader({
    title: post ? post.category || "게시글 상세" : "게시글 상세",
    hasback: true,
    menuItems: headerMenu,
  });

  const handleWriterClick = (memberId: number) => {
    setSelectedMemberId(memberId);
    setIsProfileModalOpen(true);
  };

  return (
    <Wrapper>
      {post ? (
        <>
          <PostWrapper>
            <PostContentContainer ClubRecruit={post} onWriterClick={handleWriterClick} />
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
                onWriterClick={handleWriterClick}
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
          <UserProfileModal
            memberId={selectedMemberId}
            isOpen={isProfileModalOpen}
            onOpenChange={setIsProfileModalOpen}
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
