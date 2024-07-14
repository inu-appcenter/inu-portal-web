import styled from 'styled-components';
import { useState } from 'react';
import { postFolders } from '../../../utils/API/Folders';

interface AddFolderProps {
  token: string;
  onFolderAdded: () => void; // 폴더 추가 후 호출되는 콜백 함수
}

export default function AddFolder({ token, onFolderAdded }: AddFolderProps) {
  const [folderName, setFolderName] = useState('');

  const handleAddFolder = async () => {
    if (folderName.trim() === '') {
      alert('폴더 이름을 입력해주세요.');
      return;
    }
    try {
      await postFolders(token, folderName);
      onFolderAdded(); // 폴더 추가 후 콜백 함수 호출
    } catch (error) {
      console.error('폴더 생성 오류', error);
    }
  };

  return (
    <AddFolderWrapper>
      <FolderInput
        type="text"
        value={folderName}
        onChange={(e) => setFolderName(e.target.value)}
        placeholder="폴더 이름을 입력하세요."
      />
      <AddButton onClick={handleAddFolder}>확인</AddButton>
    </AddFolderWrapper>
  );
}

const AddFolderWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  width: 100%;
  padding-top: 16px;
`;

const FolderInput = styled.input`
  max-width: calc(90% - 16px);
  width: calc(374px - 16px);
  padding-left: 16px;
  height: 72px;
  border-radius: 10px;
  background-color: #F9F9F9;
  border: none;
  box-shadow: 0px 2px 8px 0px #0000001A;
  font-size: 14px;
  font-weight: 500;
`;

const AddButton = styled.button`
  width: 80px;
  height: 32px;
  border: none;
  background-color: #9CAFE2;
  color: white;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 700;
`;
