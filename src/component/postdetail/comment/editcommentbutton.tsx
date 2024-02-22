import React from 'react';
import editComment from '../../../utils/editComment';

interface EditCommentButtonProps {
  token: string;
  id: number;
  currentContent: string;
  isAnonymous: boolean;
  onCommentUpdate: () => void;
}

const EditCommentButton: React.FC<EditCommentButtonProps> = ({ token, id, currentContent, isAnonymous, onCommentUpdate }) => {
  const handleEditClick = async () => {
    const newContent = prompt("수정:", currentContent);
    if (newContent !== null && newContent !== currentContent) {
      try {
        const response = await editComment(token, id, newContent, isAnonymous);
        if (response === 200) {
          // alert("수정 성공");
          onCommentUpdate();
        }
        else if (response === 403) {
          alert('이 댓글의 수정에 대한 권한이 없습니다.');
        }
        else {
          alert('수정 에러');
        }
       }
       catch (error) {
        console.error("수정 에러", error);
        alert('수정 에러');
       }
      }
  };

  return <button onClick={handleEditClick}>수정</button>;
};

export default EditCommentButton;
