import styled from "styled-components";
import { useEffect, useState } from "react";
import { deletePost, getPostDetail } from "apis/posts";
import PostContentContainer from "mobile/containers/postdetail/PostContentContainer";
import CommentListMobile from "mobile/containers/postdetail/CommentListContainer";
import ReplyInput from "mobile/containers/postdetail/ReplyInput";
import { PostDetail, Reply } from "types/posts";
import axios, { AxiosError } from "axios";
import { useLocation } from "react-router-dom";
import useMobileNavigate from "hooks/useMobileNavigate";
import MobileHeader from "../containers/common/MobileHeader.tsx";

export default function PostDetailPage() {
  const [post, setPost] = useState<PostDetail>();
  const [commentUpdated, setCommentUpdated] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [replyToEdit, setReplyToEdit] = useState<Reply | null>(null);
  const [replyToReply, setReplyToReply] = useState<Reply | null>(null);

  const cancelEditOrReply = () => {
    setReplyToEdit(null);
    setReplyToReply(null);
    setReplyContent("");
  };

  const mobileNavigate = useMobileNavigate();
  const location = useLocation();

  const fetchPost = async (id: number) => {
    try {
      const response = await getPostDetail(id);
      console.log("게시글 가져오기 성공!!!");
      setPost(response.data);
      console.log(response);
      setCommentUpdated(false);
    } catch (error) {
      console.error("게시글 가져오기 실패", error);
      // refreshError가 아닌 경우 처리
      if (
        axios.isAxiosError(error) &&
        !(error as AxiosError & { isRefreshError?: boolean }).isRefreshError &&
        error.response
      ) {
        switch (error.response.status) {
          case 404:
            alert("존재하지 않는 게시글입니다.");
            mobileNavigate(-1);
            break;
          default:
            alert("게시글 가져오기 실패");
            mobileNavigate(-1);
            break;
        }
      }
    }
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm("정말 삭제할까요?");
    if (!confirmDelete) return;

    if (!post?.id) {
      alert("게시글 삭제 중 오류가 발생했습니다.");
      return;
    }

    try {
      await deletePost(post?.id);
      alert("삭제되었습니다.");
      mobileNavigate(-1);
    } catch (error) {
      console.error("게시글 삭제 실패", error);
      // refreshError가 아닌 경우 처리
      if (
        axios.isAxiosError(error) &&
        !(error as AxiosError & { isRefreshError?: boolean }).isRefreshError &&
        error.response
      ) {
        switch (error.response.status) {
          case 403:
            alert("이 게시글의 수정/삭제에 대한 권한이 없습니다.");
            break;
          case 404:
            alert("존재하지 않는 게시글입니다.");
            break;
          default:
            alert("게시글 삭제 실패");
            break;
        }
      }
    }
  };

  const handleEdit = () => {
    mobileNavigate(`/home/tips/write/${post?.id}`);
  };

  useEffect(() => {
    if (location.pathname.includes("/postdetail")) {
      const params = new URLSearchParams(location.search);
      fetchPost(Number(params.get("id")) || 0);
    }
  }, [location.pathname, commentUpdated]);

  const menuItems = [
    {
      label: "수정하기",
      onClick: () => {
        handleEdit();
      },
    },
    {
      label: "삭제하기",
      onClick: () => {
        handleDelete();
      },
    },
  ];

  return (
    <Wrapper>
      <MobileHeader
        title={"게시글 상세"}
        menuItems={post?.hasAuthority ? menuItems : undefined}
      />
      {post ? (
        <>
          <PostWrapper>
            <PostContentContainer ClubRecruit={post} />
            <CommentWrapper>
              <CommentListMobile
                bestReply={post.bestReplies[0]}
                replies={post.replies}
                setReplyToReply={setReplyToReply}
                setReplyToEdit={setReplyToEdit}
                setReplyContent={setReplyContent}
                onCommentUpdate={() => setCommentUpdated(true)}
              />
            </CommentWrapper>
          </PostWrapper>
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
        </>
      ) : (
        <div>Loading...</div>
      )}
    </Wrapper>
  );
}
const Wrapper = styled.div`
  width: 100%;
  //height: calc(100svh - 65px);
  padding-top: 56px;
  box-sizing: border-box;
`;

const PostWrapper = styled.div`
  display: flex;
  flex-direction: column;
  //height: calc(100svh - 135px);
  //overflow-y: auto;
  position: relative;
  z-index: 1;
`;
const CommentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
  padding-bottom: 20px;
  margin-bottom: 80px;
  position: relative;
`;
