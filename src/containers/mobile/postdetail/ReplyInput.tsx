import styled from "styled-components";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios, { AxiosError } from "axios";
import { Reply } from "@/types/posts";
import { ROUTES } from "@/constants/routes";
import useUserStore from "@/stores/useUserStore";
import { postReply, postReReply, putReply } from "@/apis/replies";
import checkedCheckbox from "@/resources/assets/posts/checked-checkbox.svg";
import uncheckedCheckbox from "@/resources/assets/posts/unchecked-checkbox.svg";
import enter from "@/resources/assets/posts/enter.svg";
import { mixpanelTrack } from "@/utils/mixpanel";

interface ReplyInputProps {
  postId: number;
  replyContent: string;
  isAnonymous: boolean;
  replyToEdit: Reply | null;
  replyToReply: Reply | null;
  setReplyToEdit: (reply: Reply | null) => void;
  setReplyToReply: (reply: Reply | null) => void;
  setReplyContent: (content: string) => void;
  setIsAnonymous: (value: boolean) => void;
  onCommentUpdate: () => void;
  cancelEditOrReply: () => void;
}

export default function ReplyInput({
  postId,
  replyContent,
  isAnonymous,
  replyToEdit,
  replyToReply,
  setReplyToEdit,
  setReplyContent,
  setReplyToReply,
  setIsAnonymous,
  onCommentUpdate,
  cancelEditOrReply,
}: ReplyInputProps) {
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
        mixpanelTrack.boardInteraction("Comment", "TIPS", "Re-Reply");
        setReplyToReply(null);
      } else if (replyToEdit) {
        await putReply(replyToEdit.id, replyContent, isAnonymous);
        setReplyToEdit(null);
      } else {
        await postReply(postId, replyContent, isAnonymous);
        mixpanelTrack.boardInteraction("Comment", "TIPS", "Reply");
      }

      setReplyContent("");
      onCommentUpdate();
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

  return (
    <StyledReplyInput>
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
              placeholder="댓글을 입력하세요"
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
    </StyledReplyInput>
  );
}

const StyledReplyInput = styled.div`
  position: fixed;
  bottom: calc(16px + env(safe-area-inset-bottom));
  left: 50%;
  transform: translateX(-50%);
  width: calc(100% - 32px);
  max-width: 480px;
  z-index: 9999;
  background: var(--bg-base, #ffffff);
  border: 1px solid var(--border-strong, #d1d6db);
  border-radius: 32px;
  box-shadow: 0px 4px 12px 0px rgba(0, 0, 0, 0.08);
  backdrop-filter: blur(10px);
  padding: 4px;
  box-sizing: border-box;

  .wrapper {
    display: flex;
    align-items: center;
    gap: 4px;
    width: 100%;
    min-height: 48px;
  }

  .anonymous-wrapper {
    flex: 0 0 auto;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    height: 44px;
    padding-left: 12px;
    padding-right: 8px;
    cursor: pointer;
    user-select: none;
    white-space: nowrap;

    img {
      width: 18px;
      height: 18px;
      flex-shrink: 0;
      display: block;
    }

    span {
      font-family: Pretendard, sans-serif;
      font-size: 12px;
      line-height: 16px;
      color: var(--text-disabled, #b0b8c1);
      white-space: nowrap;
    }
  }

  input {
    flex: 1;
    min-width: 0;
    display: block;
    margin: 0;
    height: 44px;
    border: none;
    background: transparent;
    padding: 0 8px;
    font-family: Pretendard, sans-serif;
    font-size: 16px;
    line-height: 1.6;
    color: var(--text-secondary, #333d4b);
    outline: none;
    box-sizing: border-box;

    &::placeholder {
      color: var(--text-disabled, #b0b8c1);
    }
  }

  .login-placeholder {
    cursor: pointer;
  }

  .send-button {
    flex: 0 0 40px;
    width: 40px;
    height: 40px;
    padding: 8px;
    box-sizing: border-box;
    display: block;
    cursor: pointer;
  }
`;

const EditOrReplyBanner = styled.div`
  position: absolute;
  top: -28px;
  left: 16px;
  font-family: Pretendard, sans-serif;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 8px;
  background: white;
  padding: 4px 12px;
  border-radius: 12px;
  border: 1px solid var(--border-default, #e5e8eb);
  box-shadow: 0px 2px 6px rgba(0, 0, 0, 0.05);

  button {
    font-family: Pretendard, sans-serif;
    font-size: 13px;
    padding: 0;
    color: var(--text-tertiary, #8b95a1);
    background-color: transparent;
    border: none;
    cursor: pointer;
  }
`;
