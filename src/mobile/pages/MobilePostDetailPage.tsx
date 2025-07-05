import styled from "styled-components";
import { useEffect, useState } from "react";
import { getPostDetail } from "apis/posts";
import PostContentContainer from "mobile/containers/postdetail/PostContentContainer";
import CommentListMobile from "mobile/containers/postdetail/CommentListContainer";
import ReplyInput from "mobile/containers/postdetail/ReplyInput";
import { Reply } from "types/posts";
import { PostDetail } from "types/posts";
import axios, { AxiosError } from "axios";
import { useLocation } from "react-router-dom";
import useMobileNavigate from "hooks/useMobileNavigate";

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
      setPost(response.data);
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

  useEffect(() => {
    if (location.pathname.includes("/postdetail")) {
      const params = new URLSearchParams(location.search);
      fetchPost(Number(params.get("id")) || 0);
    }
  }, [location.pathname, commentUpdated]);

  return (
    <>
      {post ? (
        <>
          <Wrapper>
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
          </Wrapper>
        </>
      ) : (
        <div>Loading...</div>
      )}
    </>
  );
}
const Wrapper = styled.div`
  width: 100%;
  height: calc(100svh - 65px);
`;

const PostWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: calc(100svh - 135px);
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
