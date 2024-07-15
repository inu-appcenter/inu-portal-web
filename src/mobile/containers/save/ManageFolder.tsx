import styled from 'styled-components';
import { useEffect, useState } from 'react';
import { getFolders, postFolders, putFolders, deleteFolders } from '../../../utils/API/Folders';

interface ManageFolderProps {
  token: string;
  onFolderManaged: () => void; // 폴더 관리 후 호출되는 콜백 함수
}

interface Folder {
  id: number;
  name: string;
}

export default function ManageFolder({ token, onFolderManaged }: ManageFolderProps) {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [newFolderName, setNewFolderName] = useState('');
  const [editingFolderId, setEditingFolderId] = useState<number | null>(null);
  const [editingFolderName, setEditingFolderName] = useState('');

  const fetchFolders = async () => {
    try {
      const response = await getFolders(token);
      if (response.status === 200) {
        setFolders(response.body.data);
      }
    } catch (error) {
      console.error('폴더 목록 가져오기 오류', error);
    }
  };

  const handleAddFolder = async () => {
    if (newFolderName.trim() === '') {
      alert('폴더 이름을 입력해주세요.');
      return;
    }
    try {
      await postFolders(token, newFolderName);
      setNewFolderName('');
      fetchFolders();
      onFolderManaged();
    } catch (error) {
      console.error('폴더 생성 오류', error);
    }
  };

  const handleEditFolder = async (folderId: number) => {
    if (editingFolderName.trim() === '') {
      alert('폴더 이름을 입력해주세요.');
      return;
    }
    try {
      await putFolders(token, folderId, editingFolderName);
      setEditingFolderId(null);
      setEditingFolderName('');
      fetchFolders();
      onFolderManaged();
    } catch (error) {
      console.error('폴더 수정 오류', error);
    }
  };

  const handleDeleteFolder = async (folderId: number) => {
    if (window.confirm('폴더를 삭제하시겠습니까?')) {
      try {
        await deleteFolders(token, folderId);
        fetchFolders();
        onFolderManaged();
      } catch (error) {
        console.error('폴더 삭제 오류', error);
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingFolderId(null);
    setEditingFolderName('');
  };

  useEffect(() => {
    fetchFolders();
  }, []);

  return (
    <ManageFolderWrapper>
      <FolderInputWrapper>
        <FolderAddInput
          type="text"
          value={newFolderName}
          onChange={(e) => setNewFolderName(e.target.value)}
          placeholder="폴더 이름을 입력하세요."
        />
        <AddButton onClick={handleAddFolder}>확인</AddButton>
      </FolderInputWrapper>
      <FolderList>
        {folders.map((folder) => (
          <FolderItem key={folder.id}>
            {editingFolderId === folder.id ? (
              <EditFolderWrapper>
                <FolderEditInput
                  type="text"
                  value={editingFolderName}
                  onChange={(e) => setEditingFolderName(e.target.value)}
                  placeholder="폴더 이름을 입력하세요."
                />
                <SaveButton onClick={() => handleEditFolder(folder.id)}>저장</SaveButton>
                <CancelButton onClick={handleCancelEdit}>취소</CancelButton>
              </EditFolderWrapper>
            ) : (
              <>
                <FolderName>{folder.name}</FolderName>
                <EditButton onClick={() => { setEditingFolderId(folder.id); setEditingFolderName(folder.name); }}>수정</EditButton>
                <DeleteButton onClick={() => handleDeleteFolder(folder.id)}>삭제</DeleteButton>
              </>
            )}
          </FolderItem>
        ))}
      </FolderList>
    </ManageFolderWrapper>
  );
}

const ManageFolderWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  width: 100%;
  padding-top: 16px;
`;

const FolderInputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  width: 100%;
`;

const FolderAddInput = styled.input`
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

const FolderList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
`;

const FolderItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: calc(100% - 8px);
  padding-left: 8px;
`;

const EditFolderWrapper = styled.div`
  display: flex;
  gap: 8px;
  width: 100%;
`;

const FolderEditInput = styled.input`
  flex-grow: 1;
  padding: 8px;
  border-radius: 4px;
  border: 1px solid #ddd;
`;

const FolderName = styled.span`
  flex-grow: 1;
`;

const EditButton = styled.button`
  background-color: #FFA500;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 4px 8px;
  cursor: pointer;
`;

const SaveButton = styled.button`
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 4px 8px;
  cursor: pointer;
`;

const CancelButton = styled.button`
  background-color: #888;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 4px 8px;
  cursor: pointer;
`;

const DeleteButton = styled.button`
  background-color: #FF0000;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 4px 8px;
  cursor: pointer;
`;
