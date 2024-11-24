import styled from "styled-components";
import { useState } from "react";
import { Reply } from "types/posts";
import CommentImg from "resources/assets/mobile-tips/comment-img.svg";
import rereplyImage from "resources/assets/posts/rereply.svg";
import ReplyLikeButton from "components/posts/ReplyLikeButton";
import checkedCheckbox from "resources/assets/posts/checked-checkbox.svg";
import uncheckedCheckbox from "resources/assets/posts/unchecked-checkbox.svg";
import enter from "resources/assets/posts/enter.svg";
import React from "react";
import axios, { AxiosError } from "axios";
import { deleteReply, postReply, postReReply, putReply } from "apis/replies";

interface CommentListProps {
  postId: number;
  bestReply: Reply;
  replies: Reply[];
  onCommentUpdate: () => void;
}

export default function CommentListMobile({
  postId,
  bestReply,
  replies,
  onCommentUpdate,
}: CommentListProps) {
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
      (now.getTime() - commentDate.getTime()) / (1000 * 60 * 60 * 24)
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
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [replyToEdit, setReplyToEdit] = useState<Reply | null>(null);
  const [replyToReply, setReplyToReply] = useState<Reply | null>(null);
  const [loading, setLoading] = useState(false);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      handleCreateReply();
    }
  };

  const handleCreateReply = async () => {
    if (loading) {
      return;
    }
    if (!replyContent) {
      alert("댓글 내용을 작성해주세요.");
      return;
    }
    setLoading(true);
    if (replyToReply) {
      // 대댓글 등록
      try {
        await postReReply(replyToReply.id, replyContent, isAnonymous);
        setReplyToReply(null);
        onCommentUpdate();
      } catch (error) {
        console.error("대댓글 등록 실패", error);
        // refreshError가 아닌 경우 처리
        if (
          axios.isAxiosError(error) &&
          !(error as AxiosError & { isRefreshError?: boolean })
            .isRefreshError &&
          error.response
        ) {
          switch (error.response.status) {
            case 400:
              alert(
                "일정 시간 동안 같은 게시글이나 댓글을 작성할 수 없습니다."
              );
              break;
            case 404:
              alert(
                "존재하지 않는 회원입니다. / 존재하지 않는 게시글입니다. / 존재하지 않는 댓글입니다."
              );
              break;
            default:
              alert("대댓글 등록 실패");
              break;
          }
        }
      }
    } else if (replyToEdit) {
      // 댓글 수정
      try {
        await putReply(replyToEdit.id, replyContent, isAnonymous);
        setReplyToEdit(null);
        onCommentUpdate();
      } catch (error) {
        console.error("댓글 수정 실패", error);
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
              alert("댓글 수정 실패");
              break;
          }
        }
      }
    } else {
      // 일반 댓글 작성
      try {
        await postReply(postId, replyContent, isAnonymous);
        onCommentUpdate();
      } catch (error) {
        console.error("댓글 등록 실패", error);
        // refreshError가 아닌 경우 처리
        if (
          axios.isAxiosError(error) &&
          !(error as AxiosError & { isRefreshError?: boolean })
            .isRefreshError &&
          error.response
        ) {
          switch (error.response.status) {
            case 400:
              alert(
                "일정 시간 동안 같은 게시글이나 댓글을 작성할 수 없습니다."
              );
              break;
            case 404:
              alert("존재하지 않는 회원입니다. / 존재하지 않는 게시글입니다.");
              break;
            default:
              alert("댓글 등록 실패");
              break;
          }
        }
      }
    }
    setReplyContent("");
    setLoading(false);
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
    setReplyToReply(reply);
    setReplyToEdit(null);
    setReplyContent("");
  };

  const handleEditReply = (reply: Reply) => {
    setReplyToReply(null);
    setReplyToEdit(reply);
    setReplyContent(reply.content);
  };

  const cancelEditOrReply = () => {
    setReplyToEdit(null);
    setReplyToReply(null);
    setReplyContent("");
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
                    src={`https://portal.inuappcenter.kr/api/images/${reply.fireId}`}
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
                      like={reply.like}
                      isLiked={reply.isLiked}
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
      <ReplyInput>
        {(replyToEdit || replyToReply) && (
          <EditOrReplyBanner>
            {replyToEdit && (
              <>
                댓글 수정 중<button onClick={cancelEditOrReply}>취소</button>
              </>
            )}
            {replyToReply && (
              <>
                {replyToReply.writer}에게 답장 중
                <button onClick={cancelEditOrReply}>취소</button>
              </>
            )}
          </EditOrReplyBanner>
        )}
        <div className="wrapper">
          <span
            className="anonymous-wrapper"
            onClick={() => setIsAnonymous(!isAnonymous)}
          >
            <img
              src={isAnonymous ? checkedCheckbox : uncheckedCheckbox}
              alt=""
            />
            <span>익명</span>
          </span>
          <input
            placeholder="댓글을 입력해주세요."
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            onKeyDown={handleKeyPress}
          />
          <img src={enter} alt="전송" onClick={handleCreateReply} />
        </div>
      </ReplyInput>
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

const ReplyInput = styled.div`
  border-top: 4px solid #eaeaea;
  position: fixed;
  bottom: 0;
  z-index: 100;
  height: 64px;
  width: 100vw;
  background-color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  .wrapper {
    flex: 1;
    padding: 12px;

    display: flex;
    align-items: center;
    gap: 12px;

    .anonymous-wrapper {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    span {
      font-size: 16px;
    }

    input {
      flex: 1;
      font-size: 14px;
      height: 36px;
      border: none;
      padding-left: 12px;
      border-radius: 12px;
      background-color: #eff2f9;
    }
  }
`;

const EditOrReplyBanner = styled.div`
  position: absolute;
  top: 0;
  left: 16px;
  font-size: 14px;
  display: flex;
  gap: 8px;
  background-color: white;
  button {
    font-size: 14px;
    padding: 0;
    color: #888;
    background-color: transparent;
    border: none;
  }
`;
