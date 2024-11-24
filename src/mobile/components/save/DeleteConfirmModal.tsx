import styled from "styled-components";

interface DeleteConfirmModalProps {
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DeleteConfirmModal({
  onConfirm,
  onCancel,
}: DeleteConfirmModalProps) {
  return (
    <ModalOverlay>
      <ModalContent>
        <Message>선택하신 항목을 삭제하시겠습니까?</Message>
        <ButtonGroup>
          <Button onClick={onConfirm}>확인</Button>
          <Button onClick={onCancel}>취소</Button>
        </ButtonGroup>
      </ModalContent>
    </ModalOverlay>
  );
}

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: #f9f9f9;
  box-shadow: 0px 4px 4px 0px #00000040;
  border-radius: 10px;
  width: 90%;
  max-width: 380px;
  height: 96px;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
`;

const Message = styled.div`
  font-size: 16px;
  font-weight: 700;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 32px;
`;

const Button = styled.div`
  height: 26px;
  width: 64px;
  background-color: #9cafe2;
  color: white;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
`;
