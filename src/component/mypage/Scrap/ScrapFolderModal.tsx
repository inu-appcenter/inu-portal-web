import React, { useState } from 'react';
import styled from 'styled-components';
import newFileImg from "../../../resource/assets/file-img.png"

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
            <MoalFolderImg src={newFileImg}/>
            <ModalFolderName>파일 이름</ModalFolderName> 
            <ModalFolderNameInput
                    type="text"
                    value={folderName}
                    onChange={(e) => setFolderName(e.target.value)} 
                />
            <CloseButton onClick={closeModal}>x</CloseButton>
            <ModalLoginBtn onClick={handleCreateFolder}>확인</ModalLoginBtn>
          </Modal>
      </ModalWrapper>
    );
}
const ModalWrapper = styled.div`
 align-items: center;
  background-color: white;
  display: flex;
  justify-content: center;
  position: fixed; 
  top: 50%; 
  left: 50%; 
  transform: translate(-50%, -50%); 
  z-index: 100;
  width: 709px;
  height: 309px;
  border-radius: 10px;
  border: 1px solid #AAC9EE;
  padding: 20px 0;
`;

const Modal = styled.div`
  margin: 0 auto;
  text-align: center;
  display: flex;
  flex-direction: column;
`;

const MoalFolderImg = styled.img`
width: 128px;
height: 128px;
margin:0 auto;
`
const ModalFolderName = styled.p`
  color:#0E4D9D;
  font-size: 15px;
  font-weight: 600;
  line-height: 22px;
  color: #000;
`
const ModalFolderNameInput = styled.input`
  width: 249px;
  height: 32px;
  text-align: center;
  background-color: #F3F3F3;
  border-radius: 10px;
  border:none;
  margin-bottom: 46px;
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
font-size: 15px;
font-weight: 600;
background-color: #4071B9;
color:white;
border-radius: 5px;
width:71px;
height: 25px;
border-radius: 10px;
border: none;
margin:0 auto;
`

export default MakeModal;

