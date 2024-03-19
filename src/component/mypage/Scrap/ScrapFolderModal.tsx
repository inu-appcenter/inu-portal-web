import React, { useState } from 'react';
import styled from 'styled-components';


interface Props {
  closeModal: () => void;
  onChange: (folderName: string) => void; 
}


const MakeModal:  React.FC<Props> = ({ closeModal,onChange }) => {
  const [folderName, setFolderName] = useState<string>('');
  const handleCreateFolder = () => {
    onChange(folderName);
    closeModal(); // 모달 닫기
};

    return (
        <ModalWrapper >
          <Modal>
            <ModalFolderName>폴더 이름</ModalFolderName> 
            <ModalFolderNameInput
                    type="text"
                    value={folderName}
                    onChange={(e) => setFolderName(e.target.value)} 
                />
            <CloseButton onClick={closeModal}>x</CloseButton>
            <ModalLoginBtn onClick={handleCreateFolder}>폴더 생성</ModalLoginBtn>
          </Modal>
      </ModalWrapper>
    );
}
const ModalWrapper = styled.div`
  align-items: center;
  background-color: rgba(112, 112, 112, 0.473);
  display: flex;
  height: 40vh;
  justify-content: center;
  left: 0;
  overflow: hidden;
  position: absolute;
  top: 10%;
  width: 50%;
  z-index: 100;
  margin-left: 25%;
  border-radius: 10px;
`;

const Modal = styled.div`
  margin: 0 auto;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap:30px;
`;


const ModalFolderName = styled.p`
  color:#0E4D9D;
  font-size: 18px;
  font-weight: 600;
  line-height: 22px;
  background-color: white;
  border-radius: 5px;
`
const ModalFolderNameInput = styled.input`
  padding:10px 50px;
  text-align: center;
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
`

export default MakeModal;

