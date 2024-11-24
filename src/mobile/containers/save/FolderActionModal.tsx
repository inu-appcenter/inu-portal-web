// FolderActionModal.tsx
import styled from "styled-components";

interface FolderActionModalProps {
  onAddFolder: () => void;
  onManageFolders: () => void;
  onClose: () => void;
}

export default function FolderActionModal({
  onAddFolder,
  onManageFolders,
  onClose,
}: FolderActionModalProps) {
  return (
    <Overlay>
      <ModalWrapper>
        <ModalHeader>
          <ModalTitle>선택</ModalTitle>
          <CloseButton onClick={onClose}>
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M13.705 12.2907C13.8928 12.4784 13.9983 12.7331 13.9983 12.9987C13.9983 13.2643 13.8928 13.5189 13.705 13.7067C13.5172 13.8945 13.2625 14 12.997 14C12.7314 14 12.4767 13.8945 12.2889 13.7067L7 8.41648L1.70944 13.7051C1.52165 13.8928 1.26695 13.9983 1.00137 13.9983C0.735788 13.9983 0.481087 13.8928 0.293294 13.7051C0.105501 13.5173 2.79833e-09 13.2626 0 12.997C-2.79833e-09 12.7315 0.105501 12.4768 0.293294 12.289L5.58385 7.00042L0.29496 1.71017C0.107167 1.52239 0.00166609 1.2677 0.00166609 1.00214C0.0016661 0.736577 0.107167 0.481891 0.29496 0.294109C0.482752 0.106328 0.737454 0.000832841 1.00303 0.000832838C1.26861 0.000832836 1.52331 0.106328 1.71111 0.294109L7 5.58435L12.2906 0.293276C12.4784 0.105494 12.7331 -4.42429e-09 12.9986 0C13.2642 4.42429e-09 13.5189 0.105494 13.7067 0.293276C13.8945 0.481058 14 0.735744 14 1.00131C14 1.26687 13.8945 1.52156 13.7067 1.70934L8.41615 7.00042L13.705 12.2907Z"
                fill="#444444"
              />
            </svg>
          </CloseButton>
        </ModalHeader>
        <Button onClick={onAddFolder}>폴더 생성</Button>
        <Button onClick={onManageFolders}>폴더 수정/삭제</Button>
      </ModalWrapper>
    </Overlay>
  );
}

const Overlay = styled.div`
  z-index: 1000;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.3);
  display: flex;
  justify-content: center;
  align-items: flex-end;
`;

const ModalWrapper = styled.div`
  z-index: 1001;
  width: 100%;
  padding: 16px;
  height: 120px;
  background-color: white;
  border-radius: 20px 20px 0 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-around;
`;

const ModalHeader = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
`;

const ModalTitle = styled.div`
  font-size: 18px;
  font-weight: 600;
`;

const CloseButton = styled.div`
  color: #444444;
  width: 14px;
  height: 14px;
`;

const Button = styled.div`
  width: 100%;
  font-size: 16px;
  font-weight: 300;
  padding: 8px 0 8px 64px;
`;
