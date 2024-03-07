import React from 'react';
import styled from 'styled-components';
import loginImg from "../../resource/assets/login-logo.png";
import bubbleImg from "../../resource/assets/bubble-logo.png"
import { useNavigate } from 'react-router-dom';
interface Props {
  setOpenModal: (isOpen: boolean) => void;
    closeModal: () => void;
}

const LoginModal: React.FC<Props> = ({ setOpenModal,closeModal }) => {
    const navigate = useNavigate();
    const handleLoginClick = ()=> {
      setOpenModal(false);
      navigate('/login');
    }
    return (
        <ModalWrapper >
          <Modal>
              <ModalLoginImg src={loginImg} alt="로그인 횃불이 로고"/>
              <ModalLoginTitle/>
              <ModalContentWrapper>
                <ModalLoginContent>접근 시, 로그인이 필요합니다.</ModalLoginContent>
                <CloseButton onClick={closeModal}>x</CloseButton>
              </ModalContentWrapper>
              <ModalLoginBtn onClick={handleLoginClick}>로그인 바로가기</ModalLoginBtn>
          </Modal>
      </ModalWrapper>
    );
}
const ModalWrapper = styled.div`
  align-items: center;
  background-color: rgba(255, 255, 255, 0.664);
  display: flex;
  height: 100vh;
  justify-content: center;
  left: 0;
  overflow: hidden;
  position: absolute;
  top: 0;
  width: 100%;
  z-index: 100;
`;

const Modal = styled.div`
margin: 0 auto;
text-align: center;
`;


const ModalLoginTitle = styled.div`
  font-family: Inter;
  font-size: 25px;
  font-weight: 600;
  line-height: 20px;
  letter-spacing: 0px;
  text-align: right;
  position: absolute;
  top:200px;
  right: 700px;


  &::before {
    content: "잠깐";
    display: inline-block;
    background-image: url(${bubbleImg});

    vertical-align: middle;
    margin-right: 20px;
    width: 179px;
    height: 135px;
    background-size: cover;
    background-repeat: no-repeat;
    text-align: center;
    line-height: 120px;
  }
`;
const ModalLoginImg = styled.img`
  position: relative;
`;
const ModalContentWrapper = styled.div`
  box-shadow:0px 4px 4px 0px #00000040;
  font-family: Inter;
  font-size: 25px;
  font-weight: 700;
  line-height: 34px;
  letter-spacing: 0px;
  box-sizing: border-box;
  background-color: white;
  border-radius: 25px;
  position: relative;
`;

const ModalLoginContent = styled.p`
    padding:35px 108px;
`
const CloseButton = styled.button`
  background: none;
  padding: 5px 20px;
  font-size: 18px;
  position: absolute;
  top: 0;
  right: 0;
  width: 20px;
  height: 20px;
  position: absolute;
  border: none;
`;

const ModalLoginBtn = styled.button`
  font-family: Inter;
font-size: 18px;
font-weight: 600;
line-height: 22px;
background-color: #0E4D9D;
color:white;
border-radius: 5px;
padding:8px 15px;
`

export default LoginModal;
