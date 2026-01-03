import styled from "styled-components";
import { useEffect, useMemo, useState } from "react";
import { deletePost, getPostDetail } from "@/apis/posts";
import PostContentContainer from "@/containers/mobile/postdetail/PostContentContainer";
import CommentListMobile from "@/containers/mobile/postdetail/CommentListContainer";
import ReplyInput from "@/containers/mobile/postdetail/ReplyInput";
import { PostDetail, Reply } from "@/types/posts";
import axios, { AxiosError } from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { useHeader } from "@/context/HeaderContext";
import ReplyPortal from "@/components/common/ReplyPortal";

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

  const navigate = useNavigate();

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
            navigate(-1);
            break;
          default:
            alert("게시글 가져오기 실패");
            navigate(-1);
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
      navigate(-1);
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
    navigate(`/home/tips/write/${post?.id}`);
  };

  const { id } = useParams<{ id: string }>(); // 경로 파라미터 추출

  useEffect(() => {
    if (id) {
      fetchPost(Number(id)); // 게시글 조회 함수 호출
    }
  }, [id, commentUpdated]); // id 또는 댓글 갱신 시 실행

  // 메뉴 아이템 메모이제이션
  const menuItems = useMemo(() => {
    // 권한 확인
    if (!post?.hasAuthority) return undefined;

    return [
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
  }, [post?.hasAuthority]); // 의존성 배열

  // 헤더 설정 주입
  useHeader({
    title: "게시글 상세",
    menuItems,
  });

  return (
    <Wrapper>
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
  //padding-top: 56px;
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
// PostDetailPage.tsx 내 스타일 수정

const CommentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
  /* ReplyInput 높이(약 64px~80px)만큼 하단 패딩 확보 */
  padding-bottom: 120px;
  position: relative;
`;
