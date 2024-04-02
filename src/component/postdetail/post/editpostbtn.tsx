// EditPostBtn.tsx
import React from 'react';
import { useNavigate} from 'react-router-dom';
import styled from 'styled-components';

interface EditPostBtnProps {
  handleEditPost: (id: number) => void;
  id: number;
}

const EditPostBtn: React.FC<EditPostBtnProps> = ({ handleEditPost, id }) => {
  const navigate = useNavigate();

  const handleEditButtonClick = async () => {
    try {
      // 서버에 postId를 전송
      const response = await handleEditPost(id);
      // 수정 후 어떤 화면으로 이동할지에 대한 로직
      window.open(`/update/${id}`, '_blank');
    } catch (error) {
      console.error('에러?:', error);
    }
  };

  return (
      <button onClick={handleEditButtonClick}>수정하기</button>
  );
};


export default EditPostBtn;
