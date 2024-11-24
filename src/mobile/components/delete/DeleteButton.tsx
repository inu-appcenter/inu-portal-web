import { useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { deleteMembers } from "apis/members";

export default function DeleteButton() {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleDeleteAccount = async () => {
    const confirmDelete = window.confirm("정말로 탈퇴하시겠습니까?");
    if (!confirmDelete) {
      return;
    }

    try {
      await deleteMembers();
      alert("회원 탈퇴가 완료되었습니다.");
      navigate("/");
      return;
    } catch (error) {
      console.error("회원 탈퇴 실패");
    }
  };

  return (
    <>
      <ButtonWrapper>
        <UserCancelButton onClick={() => navigate(-1)}>취소</UserCancelButton>
        <UserDeleteButton onClick={() => setIsModalOpen(true)}>
          계정 삭제
        </UserDeleteButton>
      </ButtonWrapper>

      {isModalOpen && (
        <ModalOverlay>
          <ModalContent>
            <p>정말로 계정을 삭제하시겠습니까?</p>
            <ModalButtons>
              <CancelButton onClick={() => setIsModalOpen(false)}>
                취소
              </CancelButton>
              <ConfirmButton
                onClick={() => {
                  handleDeleteAccount();
                  setIsModalOpen(false);
                }}
              >
                삭제
              </ConfirmButton>
            </ModalButtons>
          </ModalContent>
        </ModalOverlay>
      )}
    </>
  );
}

const ButtonWrapper = styled.div`
  display: flex;
  padding: 0 40px;
  justify-content: space-between;
`;

const UserCancelButton = styled.button`
  background-color: #f0f0f0;
  border: none;
  padding: 10px 60px;
  cursor: pointer;
  font-family: Roboto;
  font-size: 14px;
  font-weight: 500;
  color: #0e4d9d;
  border-radius: 10px;
  box-sizing: border-box;
`;

const UserDeleteButton = styled.button`
  background-color: #f0f0f0;
  border: none;
  padding: 10px 50px;
  cursor: pointer;
  font-family: Roboto;
  font-size: 14px;
  font-weight: 500;
  color: #df5532;
  border-radius: 10px;
  box-sizing: border-box;
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  padding: 20px;
  border-radius: 10px;
  text-align: center;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
`;

const ModalButtons = styled.div`
  margin-top: 20px;
  display: flex;
  justify-content: center;
  gap: 10px;
`;

const CancelButton = styled.button`
  background-color: #ccc;
  border: none;
  padding: 10px 20px;
  cursor: pointer;
  font-family: Roboto;
  font-size: 14px;
  color: #333;
  border-radius: 5px;
`;

const ConfirmButton = styled.button`
  background-color: #df5532;
  border: none;
  padding: 10px 20px;
  cursor: pointer;
  font-family: Roboto;
  font-size: 14px;
  color: white;
  border-radius: 5px;
`;
