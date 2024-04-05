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

