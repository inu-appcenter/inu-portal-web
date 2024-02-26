// 수정 버튼 만들기
import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

interface EditPostBtnProps {
  handleEditPost: () => void;
}

const EditPostBtn: React.FC<EditPostBtnProps> = ({ handleEditPost }) => {
  const navigate = useNavigate();

  return (
    <EditPostBtnWrapper>
      <button
        onClick={() => {
          handleEditPost();
          navigate('/update')
        }}
      >
        수정하기
      </button>
    </EditPostBtnWrapper>
  );
};

const EditPostBtnWrapper = styled.div``;

export default EditPostBtn;
