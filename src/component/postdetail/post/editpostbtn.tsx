// EditPostBtn.tsx
import React from 'react';
import styled from 'styled-components';

interface EditPostBtnProps {
  id: string;
}

const EditPostBtn: React.FC<EditPostBtnProps> = ({ id }) => {

  const handleEditButtonClick = async () => {
    try {
      window.open(`/update/${id}`, '_blank');
    } catch (error) {
      console.error('에러?:', error);
    }
  };

  return (
      <EditBtn onClick={handleEditButtonClick}>수정하기</EditBtn>
  );
};

const EditBtn = styled.span`
width: 76px;
height: 30px;
border-radius: 10px;
background: #EFF2F9;
font-family: Inter;
font-size: 15px;
font-weight: 500;
color: #757575;
display: flex;
justify-content: center; /* 수평 가운데 정렬 */
align-items: center; /* 수직 가운데 정렬 */
` 

export default EditPostBtn;

