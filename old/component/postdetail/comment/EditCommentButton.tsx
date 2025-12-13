import { putReplies } from "old/utils/API/Replies";
import styled from "styled-components";

interface EditCommentButtonProps {
  token: string;
  id: number;
  currentContent: string;
  isAnonymous: boolean;
  onCommentUpdate: () => void;
}

export default function EditCommentButton({
  token,
  id,
  currentContent,
  isAnonymous,
  onCommentUpdate,
}: EditCommentButtonProps) {
  const handleEditClick = async () => {
    const newContent = prompt("수정:", currentContent);
    if (newContent !== null && newContent !== currentContent) {
      try {
        const response = await putReplies(token, id, newContent, isAnonymous);
        if (response.status === 200) {
          onCommentUpdate();
        } else if (response.status === 403) {
          alert("이 댓글의 수정에 대한 권한이 없습니다.");
        } else {
          alert("수정 에러");
        }
      } catch (error) {
        console.error("수정 에러", error);
        alert("수정 에러");
      }
    }
  };

  return <CommentUtility onClick={handleEditClick}>수정</CommentUtility>;
}

// Styled Components
const CommentUtility = styled.span`
  font-size: 10px;
  font-weight: 500;
  color: #888888;
  padding-right: 5px;
  cursor: pointer;
`;
