import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import pencilImg from '../../resource/assets/Pencil.svg';

import { useSelector } from 'react-redux';
import { useState } from 'react';
import LoginModal from '../common/LoginModal';

interface loginInfo {
  user: {
    token: string;
  };
}
export default function PostBtn() {
  const navigate = useNavigate();
  const user = useSelector((state: loginInfo) => state.user);
  const [isOpenModal, setOpenModal] = useState<boolean>(false);
  
  const handlePostClick = () => {
    if (!user.token) {
      // 사용자가 로그인되어 있지 않으면 모달을 열기
      setOpenModal(true);
    } else {
      // 사용자가 로그인되어 있으면 글쓰기 페이지로 이동
      window.open('/write', '_blank');
    }
  };

  const closeModal = () => {
    setOpenModal(false); // 모달을 닫기 위해 상태 업데이트
};

  return (
    <>
    <PostButtonWrapper onClick={handlePostClick}>
      <img src={pencilImg} alt='pencilImg'/>
    </PostButtonWrapper>
     {isOpenModal && <LoginModal setOpenModal={setOpenModal} closeModal={closeModal} />}
     </>
  )
}

const PostButtonWrapper = styled.div`
  position: absolute;
  bottom: 50px;
  right: 50px;

  width: 65px;
  height: 65px;
  border-radius: 100px;

  background: linear-gradient(90deg, rgba(111, 132, 226, 0.6) 0%, rgba(123, 171, 229, 0.6) 100%);
  
  display: flex;
  justify-content: center;
  align-items: center;

  `