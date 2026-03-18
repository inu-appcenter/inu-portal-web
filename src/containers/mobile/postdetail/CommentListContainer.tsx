import styled from "styled-components";
import { Reply } from "@/types/posts";
import { useNavigate } from "react-router-dom";
import CommentImg from "@/resources/assets/mobile-tips/comment-img.svg";
import rereplyImage from "@/resources/assets/posts/rereply.svg";
import ReplyLikeButton from "@/components/desktop/posts/ReplyLikeButton";
import React from "react";
import axios, { AxiosError } from "axios";
import { ROUTES } from "@/constants/routes";
import { deleteReply } from "@/apis/replies";
import useUserStore from "@/stores/useUserStore";

interface CommentListProps {
  bestReply: Reply;
  replies: Reply[];
  setReplyToReply: (reply: Reply | null) => void;
  setReplyToEdit: (reply: Reply | null) => void;
  setReplyContent: (content: string) => void;
  onCommentUpdate: () => void;
}

export default function CommentListMobile({
  bestReply,
  replies,
  setReplyToReply,
  setReplyToEdit,
  setReplyContent,
  onCommentUpdate,
}: CommentListProps) {
  const navigate = useNavigate();
  const { tokenInfo } = useUserStore();
  const isLoggedIn = Boolean(tokenInfo.accessToken);
  const allComments = bestReply
    ? [bestReply, ...replies.filter((reply) => reply.id !== bestReply.id)]
    : replies;

  const formatDate = (dateString: string): string => {
    // '2024.07.30' 형태를 Date 객체로 변환
    const [year, month, day] = dateString.split(".").map(Number);
    const commentDate = new Date(year, month - 1, day);
    const now = new Date();
    // 현재 날짜와 댓글 날짜 비교
    const diffInDays = Math.floor(
      (now.getTime() - commentDate.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (diffInDays === 0) {
      return "오늘";
    } else if (diffInDays < 30) {
      return `${diffInDays}일 전`;
    } else if (diffInDays < 365) {
      const diffInMonths = Math.floor(diffInDays / 30);
      return `${diffInMonths}개월 전`;
    } else {
      const diffInYears = Math.floor(diffInDays / 365);
      return `${diffInYears}년 전`;
    }
  };

  const handleDeleteReply = async (replyId: number) => {
    if (window.confirm("정말 삭제하시겠습니까?")) {
      try {
        await deleteReply(replyId);
        alert("댓글이 삭제되었습니다.");
        onCommentUpdate();
      } catch (error) {
        console.error("댓글 삭제 실패", error);
        // refreshError가 아닌 경우 처리
        if (
          axios.isAxiosError(error) &&
          !(error as AxiosError & { isRefreshError?: boolean })
            .isRefreshError &&
          error.response
        ) {
          switch (error.response.status) {
            case 403:
              alert("이 댓글의 수정/삭제에 대한 권한이 없습니다.");
              break;
            case 404:
              alert("존재하지 않는 회원입니다. / 존재하지 않는 댓글입니다.");
              break;
            default:
              alert("댓글 삭제 실패");
              break;
          }
        }
      }
    }
  };

  const handleReplyTo = (reply: Reply) => {
    if (!isLoggedIn) {
      navigate(ROUTES.LOGIN);
      return;
    }

    setReplyToReply(reply);
    setReplyToEdit(null);
    setReplyContent("");
  };

  const handleEditReply = (reply: Reply) => {
    setReplyToReply(null);
    setReplyToEdit(reply);
    setReplyContent(reply.content);
  };
  return (
    <PostRepliesWrapper>
      <div className="repliesTop">
        <img src={CommentImg} className="replyImage" alt="" />
        댓글
      </div>
      <RepliesContainer>
        {allComments.length > 0 ? (
          <>
            {allComments.map((reply, index) => (
              <React.Fragment key={reply.id}>
                <ReplyContainer $isFirst={index === 0}>
                  <img
                    className="fire"
                    src={`https://portal.inuappcenter.kr/images/profile/${reply.fireId}`}
                    alt=""
                  />
                  <div className="main">
                    <span className="writer">{reply.writer}</span>
                    <p>{reply.content}</p>
                    <div className="util-buttons">
                      <button onClick={() => handleReplyTo(reply)}>답장</button>
                      {reply.hasAuthority && (
                        <>
                          <button onClick={() => handleEditReply(reply)}>
                            수정
                          </button>
                          <button onClick={() => handleDeleteReply(reply.id)}>
                            삭제
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="date-like">
                    <span className="date">{formatDate(reply.createDate)}</span>
                    <ReplyLikeButton
                      id={reply.id}
                      like={reply.like}
                      isLiked={reply.isLiked}
                    />
                  </div>
                </ReplyContainer>
                {reply.reReplies?.map((reReply) => (
                  <ReReplyContainer key={reReply.id}>
                    <img src={rereplyImage} alt="" />
                    <span className="writer">{reReply.writer}</span>
                    <p>{reReply.content}</p>
                    <div className="util-buttons">
                      {reReply.hasAuthority && (
                        <>
                          <button onClick={() => handleEditReply(reReply)}>
                            수정
                          </button>
                          <button onClick={() => handleDeleteReply(reReply.id)}>
                            삭제
                          </button>
                        </>
                      )}
                    </div>
                    <ReplyLikeButton
                      id={reReply.id}
                      like={reReply.like}
                      isLiked={reReply.isLiked}
                    />
                  </ReReplyContainer>
                ))}
              </React.Fragment>
            ))}
          </>
        ) : (
          <ReplyContainer $isFirst={true}>아직 댓글이 없어요 🤫</ReplyContainer>
        )}
      </RepliesContainer>
    </PostRepliesWrapper>
  );
}

const PostRepliesWrapper = styled.div`
  display: flex;
  flex-direction: column;
  .repliesTop {
    padding: 12px 24px;
    display: flex;
    align-items: center;
    gap: 8px;
    background-color: #eff2f9;
    .replyImage {
      width: 14px;
    }
  }
`;

const RepliesContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const ReplyContainer = styled.div<{ $isFirst: boolean }>`
  padding: 12px 24px;
  border-top: ${({ $isFirst }) => ($isFirst ? "none" : "2px solid #dedede")};
  display: flex;
  align-items: center;
  gap: 16px;
  .fire {
    width: 52px;
    border-radius: 100px;
  }
  .main {
    flex: 1;
    display: flex;
    flex-direction: column;
    .writer {
      font-weight: 600;
      color: #4071b9;
    }
    p {
      margin: 0;
    }
    .util-buttons {
      display: flex;
      gap: 8px;
      margin-top: 4px;
      button {
        font-size: 14px;
        color: #888888;
        background-color: transparent;
        border: none;
        padding: 0;
      }
    }
  }
  .date-like {
    display: flex;
    flex-direction: column;
    gap: 8px;
    align-items: flex-end;
    .date {
      font-size: 14px;
      color: #888888;
    }
  }
`;

const ReReplyContainer = styled.div`
  padding: 16px 32px;
  border-top: 2px solid #dedede;
  display: flex;
  align-items: center;
  gap: 16px;
  .writer {
    font-weight: 600;
    color: #4071b9;
  }

  .util-buttons {
    display: flex;
    gap: 8px;
    margin-top: 4px;
    button {
      font-size: 14px;
      color: #888888;
      background-color: transparent;
      border: none;
    }
  }
  p {
    flex: 1;
    margin: 0;
  }
`;
