import styled from "styled-components";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios, { AxiosError } from "axios";
import { Reply } from "@/types/posts";
import { ROUTES } from "@/constants/routes";
import useUserStore from "@/stores/useUserStore";
import { deleteReply, postReply, postReReply, putReply } from "@/apis/replies";
import ReplyLikeButton from "@/components/desktop/posts/ReplyLikeButton";
import replyImage from "@/resources/assets/posts/reply.svg";
import rereplyImage from "@/resources/assets/posts/rereply.svg";
import checkedCheckbox from "@/resources/assets/posts/checked-checkbox.svg";
import uncheckedCheckbox from "@/resources/assets/posts/unchecked-checkbox.svg";
import enter from "@/resources/assets/posts/enter.svg";

export default function PostReplies({
  postId,
  replies,
  refreshReplies,
}: {
  postId: number;
  replies: Reply[];
  refreshReplies: () => void;
}) {
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [replyToEdit, setReplyToEdit] = useState<Reply | null>(null);
  const [replyToReply, setReplyToReply] = useState<Reply | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { tokenInfo } = useUserStore();
  const isLoggedIn = Boolean(tokenInfo.accessToken);

  const handleLoginRedirect = () => {
    navigate(ROUTES.LOGIN);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      handleCreateReply();
    }
  };

  const showReplyError = (
    error: unknown,
    mode: "reply" | "reReply" | "edit",
  ) => {
    if (
      axios.isAxiosError(error) &&
      !(error as AxiosError & { isRefreshError?: boolean }).isRefreshError &&
      error.response
    ) {
      const status = error.response.status;

      if (mode === "edit") {
        switch (status) {
          case 403:
            alert("해당 댓글을 수정할 권한이 없습니다.");
            return;
          case 404:
            alert("존재하지 않는 회원 또는 댓글입니다.");
            return;
          default:
            alert("댓글 수정에 실패했습니다.");
            return;
        }
      }

      if (mode === "reReply") {
        switch (status) {
          case 400:
            alert("일정 시간 동안 같은 게시글이나 댓글은 작성할 수 없습니다.");
            return;
          case 404:
            alert("존재하지 않는 회원, 게시글 또는 댓글입니다.");
            return;
          default:
            alert("대댓글 등록에 실패했습니다.");
            return;
        }
      }

      switch (status) {
        case 400:
          alert("일정 시간 동안 같은 게시글이나 댓글은 작성할 수 없습니다.");
          return;
        case 404:
          alert("존재하지 않는 회원 또는 게시글입니다.");
          return;
        default:
          alert("댓글 등록에 실패했습니다.");
      }
    }
  };

  const handleCreateReply = async () => {
    if (!isLoggedIn) {
      handleLoginRedirect();
      return;
    }
    if (loading) {
      return;
    }
    if (!replyContent.trim()) {
      alert("댓글 내용을 작성해주세요.");
      return;
    }

    setLoading(true);

    try {
      if (replyToReply) {
        await postReReply(replyToReply.id, replyContent, isAnonymous);
        setReplyToReply(null);
      } else if (replyToEdit) {
        await putReply(replyToEdit.id, replyContent, isAnonymous);
        setReplyToEdit(null);
      } else {
        await postReply(postId, replyContent, isAnonymous);
      }

      setReplyContent("");
      refreshReplies();
    } catch (error) {
      console.error("댓글 처리 실패", error);
      showReplyError(
        error,
        replyToEdit ? "edit" : replyToReply ? "reReply" : "reply",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReply = async (replyId: number) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) {
      return;
    }

    try {
      await deleteReply(replyId);
      alert("댓글이 삭제되었습니다.");
      refreshReplies();
    } catch (error) {
      console.error("댓글 삭제 실패", error);

      if (
        axios.isAxiosError(error) &&
        !(error as AxiosError & { isRefreshError?: boolean }).isRefreshError &&
        error.response
      ) {
        switch (error.response.status) {
          case 403:
            alert("해당 댓글을 삭제할 권한이 없습니다.");
            break;
          case 404:
            alert("존재하지 않는 회원 또는 댓글입니다.");
            break;
          default:
            alert("댓글 삭제에 실패했습니다.");
            break;
        }
      }
    }
  };

  const handleReplyTo = (reply: Reply) => {
    if (!isLoggedIn) {
      handleLoginRedirect();
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

  const cancelEditOrReply = () => {
    setReplyToEdit(null);
    setReplyToReply(null);
    setReplyContent("");
  };

  return (
    <PostRepliesWrapper>
      <img src={replyImage} className="replyImage" alt="" />

      <RepliesContainer>
        {replies.length > 0 ? (
          <>
            {replies.map((reply, index) => (
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
                      <button onClick={() => handleReplyTo(reply)}>답글</button>
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
                    <span className="date">{reply.createDate}</span>
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
          <ReplyContainer $isFirst={true}>아직 댓글이 없습니다.</ReplyContainer>
        )}
      </RepliesContainer>

      <ReplyInput>
        {isLoggedIn && (replyToEdit || replyToReply) && (
          <EditOrReplyBanner>
            {replyToEdit && (
              <>
                댓글 수정 중
                <button onClick={cancelEditOrReply}>취소</button>
              </>
            )}
            {replyToReply && (
              <>
                {replyToReply.writer}에게 답글 작성 중
                <button onClick={cancelEditOrReply}>취소</button>
              </>
            )}
          </EditOrReplyBanner>
        )}

        <div className="wrapper">
          <span
            className="anonymous-wrapper"
            onClick={
              isLoggedIn
                ? () => setIsAnonymous(!isAnonymous)
                : handleLoginRedirect
            }
          >
            <img src={isAnonymous ? checkedCheckbox : uncheckedCheckbox} alt="" />
            <span>익명</span>
          </span>
          {isLoggedIn ? (
            <>
              <input
                placeholder="댓글을 입력해주세요."
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                onKeyDown={handleKeyPress}
              />
              <img
                className="send-button"
                src={enter}
                alt="전송"
                onClick={handleCreateReply}
              />
            </>
          ) : (
            <input
              className="login-placeholder"
              placeholder="여기를 눌러 로그인하세요."
              readOnly
              value=""
              onClick={handleLoginRedirect}
              onFocus={(e) => e.target.blur()}
            />
          )}
        </div>
      </ReplyInput>
    </PostRepliesWrapper>
  );
}

const PostRepliesWrapper = styled.div`
  border-top: 6px solid #eaeaea;
  border-left: 6px solid #eaeaea;
  padding: 24px 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;

  .replyImage {
    width: 36px;
  }
`;

const RepliesContainer = styled.div`
  background-color: #eff2f9;
  border-radius: 20px;
  display: flex;
  flex-direction: column;
`;

const ReplyContainer = styled.div<{ $isFirst: boolean }>`
  padding: 16px 32px;
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
    gap: 4px;

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
  padding-left: 88px;
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
  position: sticky;
  bottom: 0;
  z-index: 100;
  height: 100px;
  width: 1054px;
  background-color: white;
  display: flex;
  align-items: center;
  justify-content: center;

  .wrapper {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 12px;
    min-height: 64px;
    padding: 12px;
    box-sizing: border-box;
    border-radius: 12px;
    background-color: #eff2f9;
  }

  .anonymous-wrapper {
    flex: 0 0 auto;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    height: 40px;
    padding: 0 2px;
    cursor: pointer;
    user-select: none;
    white-space: nowrap;

    img {
      width: 24px;
      height: 24px;
      flex-shrink: 0;
      display: block;
    }

    > span {
      display: inline-flex;
      align-items: center;
      font-size: 18px;
      line-height: 1;
      color: #9fa3a6;
      white-space: nowrap;
    }
  }

  input {
    flex: 1;
    min-width: 0;
    display: block;
    margin: 0;
    height: 40px;
    font-size: 20px;
    line-height: 1.25;
    border: none;
    border-left: 2px solid #b3b3b3;
    padding-left: 12px;
    background-color: transparent;
    box-sizing: border-box;
  }

  .login-placeholder {
    cursor: pointer;
    border-left: none;
    padding-left: 0;

    &::placeholder {
      color: #969696;
    }
  }

  .send-button {
    flex: 0 0 40px;
    width: 40px;
    height: 40px;
    padding: 9px;
    box-sizing: border-box;
    display: block;
    cursor: pointer;
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
