import { deleteReplies } from "old/utils/API/Replies";
import styled from "styled-components";

interface DeleteCommentButtonProps {
  token: string;
  id: number;
  onCommentUpdate: () => void;
}

export default function DeleteCommentButton({
  token,
  id,
  onCommentUpdate,
}: DeleteCommentButtonProps) {
  const handleDeleteClick = async () => {
    const confirmDelete = window.confirm("댓글을 삭제하시겠습니까?");
    if (confirmDelete) {
      try {
        const response = await deleteReplies(token, id);
        if (response.status === 200) {
          onCommentUpdate();
        } else if (response.status === 403) {
          alert("이 댓글의 삭제에 대한 권한이 없습니다.");
        } else {
          alert("삭제 에러");
        }
      } catch (error) {
        console.error("삭제 에러", error);
        alert("삭제 에러");
      }
    }
  };

  return <CommentUtility onClick={handleDeleteClick}>삭제</CommentUtility>;
}

// Styled Components
const CommentUtility = styled.span`
  font-size: 10px;
  font-weight: 500;
  color: #888888;
  padding-right: 5px;
  cursor: pointer;
`;
