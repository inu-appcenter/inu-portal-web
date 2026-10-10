import styled from "styled-components";

interface ChangeStatusModalProps {
  handleStatusChange: (status: string) => void; // status를 문자열로 받는 함수
  activeButton: string;
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>; // 모달 표시/숨김을 위한 setState 함수
  handleConfirm: (selectedReservationId: number) => void; // 확인 버튼 클릭 시 호출될 함수
  selectedReservationId: number | null; // 예약 ID
}

const ChangeStatusModal = ({
  handleStatusChange,
  activeButton,
  setShowModal,
  handleConfirm,
  selectedReservationId,
}: ChangeStatusModalProps) => {
  return (
    <ModalWrapper>
      <ModalContent>
        <h3>예약 상태 변경</h3>
        <div>
          <StatusButton
            onClick={() => handleStatusChange("CONFIRM")}
            active={activeButton === "CONFIRM"}
            status="CONFIRM"
          >
            승인
          </StatusButton>
          <StatusButton
            onClick={() => handleStatusChange("CANCELED")}
            active={activeButton === "CANCELED"}
            status="CANCELED"
          >
            거절
          </StatusButton>
        </div>
        <ConfirmCancelButtonWrapper>
          <CancelButton
            onClick={() => {
              setShowModal(false);
            }}
          >
            취소
          </CancelButton>
          <ConfirmButton
            onClick={() => {
              if (selectedReservationId != null) {
                handleConfirm(selectedReservationId);
              }
            }}
          >
            확인
          </ConfirmButton>
        </ConfirmCancelButtonWrapper>
      </ModalContent>
    </ModalWrapper>
  );
};

export default ChangeStatusModal;

const StatusButton = styled.button<{ active: boolean; status: string }>`
  background-color: ${({ active, status }) =>
    active
      ? status === "CONFIRM"
        ? "var(--interactive-primary)"
        : "var(--red-500)" // 승인: 파란색, 거절: 빨간색
      : "var(--gray-200)"};
  color: ${({ active }) => (active ? "var(--text-inverse)" : "var(--text-secondary)")};
  border: 1px solid
    ${({ active, status }) =>
      active ? (status === "CONFIRM" ? "var(--border-brand)" : "var(--text-error)") : "var(--border-strong)"};
  border-radius: 4px;
  padding: 10px 20px;
  cursor: pointer;
  margin: 0 10px;

  &:hover {
    background-color: ${({ active, status }) =>
      active ? (status === "CONFIRM" ? "var(--interactive-primary-hover)" : "var(--red-600)") : "var(--gray-300)"};
  }

  &:focus {
    outline: none;
  }
`;

const ModalWrapper = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ModalContent = styled.div`
  background-color: var(--bg-base);
  padding: 20px;
  border-radius: 8px;
  max-width: 400px;
  width: 100%;
  text-align: center;
`;

const ConfirmCancelButtonWrapper = styled.div`
  display: flex;
  justify-content: space-evenly;
  margin-top: 20px;
`;

const ConfirmButton = styled.button`
  background-color: var(--interactive-primary);
  color: var(--text-inverse);
  border: 1px solid var(--border-brand);
  border-radius: 4px;
  padding: 10px 20px;
  cursor: pointer;
  font-size: 16px;
  transition:
    background-color 0.3s ease,
    border-color 0.3s ease;

  &:hover {
    background-color: var(--interactive-primary-hover);
    border-color: var(--interactive-primary-hover);
  }

  &:focus {
    outline: none;
  }

  &:active {
    background-color: var(--interactive-primary-press);
  }
`;

const CancelButton = styled.button`
  background-color: var(--bg-subtle);
  color: var(--text-secondary);
  border: 1px solid var(--border-strong);
  border-radius: 4px;
  padding: 10px 20px;
  cursor: pointer;
  font-size: 16px;
  transition:
    background-color 0.3s ease,
    border-color 0.3s ease;

  &:hover {
    background-color: var(--gray-200);
    border-color: var(--border-strong);
  }

  &:focus {
    outline: none;
  }

  &:active {
    background-color: var(--gray-300);
  }
`;
