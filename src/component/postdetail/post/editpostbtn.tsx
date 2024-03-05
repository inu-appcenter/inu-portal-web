// EditPostBtn.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

interface EditPostBtnProps {
  handleEditPost: () => void;
  id: number; 
}

const EditPostBtn: React.FC<EditPostBtnProps> = ({ handleEditPost, id }) => {
  const navigate = useNavigate();

  const handleEditButtonClick = async () => {
    try {
      await handleEditPost(); 
      navigate(`/update`);
    } catch (error) {
      console.error('에러?:', error);
    }
  };

  return (
    <EditPostBtnWrapper>
      <button onClick={handleEditButtonClick}>수정하기</button>
    </EditPostBtnWrapper>
  );
};

const EditPostBtnWrapper = styled.div``;

export default EditPostBtn;
