import { ROUTES } from "@/constants/routes";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import LoginModalLogo from "@/resources/assets/login/login-modal-logo.svg";
import Bubble from "@/resources/assets/login/login-modal-bubble.svg";

interface Props {
  openModal: () => void;
  closeModal: () => void;
}

export default function LoginModal({ openModal, closeModal }: Props) {
  const navigate = useNavigate();
  const handleLoginClick = () => {
    openModal();
    navigate(ROUTES.LOGIN);
  };

  return (
    <StyledLoginModal onClick={closeModal}>
      <Modal>
        <ModalImg>
          <ModalLoginImg src={LoginModalLogo} alt="LoginModalLogo" />
          <ModalLoginTitle />
        </ModalImg>
        <ModalContentWrapper>
          <ModalLoginContent>접근 시, 로그인이 필요합니다.</ModalLoginContent>
          <CloseButton onClick={closeModal}>x</CloseButton>
        </ModalContentWrapper>
        <ModalLoginBtn onClick={handleLoginClick}>
          로그인 바로가기
        </ModalLoginBtn>
      </Modal>
    </StyledLoginModal>
  );
}
const StyledLoginModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: 100%;
  background-color: rgba(255, 255, 255, 0.664);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
`;

const Modal = styled.div`
  text-align: center;
`;

const ModalImg = styled.div`
  position: relative;
`;

const ModalLoginTitle = styled.div`
  font-size: 24px;
  font-weight: 600;

  &::before {
    content: "잠깐!!";
    display: inline-block;
    background-image: url(${Bubble});
    vertical-align: middle;
    width: 186px;
    height: 136px;
    background-size: cover;
    background-repeat: no-repeat;
    text-align: center;
    line-height: 120px;
    position: absolute;
    top: 0px;
    right: 8px;
  }
`;

const ModalLoginImg = styled.img`
  position: relative;
`;

const ModalContentWrapper = styled.div`
  box-shadow: 0px 4px 4px 0px #00000040;
  font-size: 24px;
  font-weight: 700;
  line-height: 24px;
  box-sizing: border-box;
  background-color: white;
  border-radius: 24px;
  position: relative;
`;

const ModalLoginContent = styled.p`
  padding: 35px 108px;
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  padding: 0;
  font-size: 20px;
  position: absolute;
  top: 12px;
  right: 16px;
`;

const ModalLoginBtn = styled.button`
  font-size: 20px;
  font-weight: 600;
  line-height: 20px;
  background: linear-gradient(90deg, #6f84e2 0%, #7babe5 100%);
  border: none;
  color: white;
  border-radius: 8px;
  padding: 12px 20px;
`;
