import React from 'react';
import deleteComment from '../../../utils/deleteComment';

interface DeleteCommentButtonProps {
  token: string;
  id: number;
  onCommentUpdate: () => void;
}

const DeleteCommentButton: React.FC<DeleteCommentButtonProps> = ({ token, id, onCommentUpdate }) => {
  const handleDeleteClick = async () => {
    const confirmDelete = window.confirm("댓글을 삭제하시겠습니까?");
  if(confirmDelete){
    try {
      const response = await deleteComment(token, id);
      if (response === 200) {
        // alert("삭제 성공");
        onCommentUpdate();
      }
      else if (response === 403) {
        alert('이 댓글의 삭제에 대한 권한이 없습니다.');
      }
      else {
        // alert('삭제 에러');
      }
    }
    catch (error) {
     console.error("삭제 에러", error);
     alert('삭제 에러');
    }
  }
  };

  return <button onClick={handleDeleteClick}>삭제</button>;
};

export default DeleteCommentButton;
