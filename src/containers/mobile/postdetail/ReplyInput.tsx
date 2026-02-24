import styled from "styled-components";
import { Reply } from "@/types/posts";
import checkedCheckbox from "@/resources/assets/posts/checked-checkbox.svg";
import uncheckedCheckbox from "@/resources/assets/posts/unchecked-checkbox.svg";
import enter from "@/resources/assets/posts/enter.svg";
import axios, { AxiosError } from "axios";
import { postReply, postReReply, putReply } from "@/apis/replies";
import { useState } from "react";

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
                "일정 시간 동안 같은 게시글이나 댓글을 작성할 수 없습니다.",
              );
              break;
            case 404:
              alert(
                "존재하지 않는 회원입니다. / 존재하지 않는 게시글입니다. / 존재하지 않는 댓글입니다.",
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
                "일정 시간 동안 같은 게시글이나 댓글을 작성할 수 없습니다.",
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

  return (
    <StyledReplyInput>
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
          <img src={isAnonymous ? checkedCheckbox : uncheckedCheckbox} alt="" />
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
    </StyledReplyInput>
  );
}

// ReplyInput.tsx 내 StyledReplyInput 수정

const StyledReplyInput = styled.div`
  position: fixed;
  bottom: 0;
  /* 화면 중앙 정렬 */
  left: 50%;
  transform: translateX(-50%);

  /* 레이아웃 제약 (SubLayout과 동일하게) */
  width: 100%;
  max-width: 768px;

  /* 최상단 레이어 설정 */
  z-index: 9999;

  background-color: white;
  border-top: 1px solid #eaeaea;

  /* iOS 하단 바 여백 */
  padding-bottom: env(safe-area-inset-bottom);

  .wrapper {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 16px;
    height: 64px;
    box-sizing: border-box;

    input {
      flex: 1;
      height: 40px;
      border: none;
      border-radius: 20px;
      background-color: #eff2f9;
      padding: 0 16px;
      font-size: 16px;
      outline: none;
    }
  }
`;

const EditOrReplyBanner = styled.div`
  position: absolute;
  top: -22px;
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
