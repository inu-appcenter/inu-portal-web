// ManageFolder.tsx
import styled from 'styled-components';
import { useEffect, useState } from 'react';
import { getFolders, postFolders, putFolders, deleteFolders } from '../../../utils/API/Folders';
import DeleteConfirmModal from '../../components/save/DeleteConfirmModal';

interface ManageFolderProps {
  token: string;
  onFolderManaged: () => void; // 폴더 관리 후 호출되는 콜백 함수
  mode: 'add' | 'manage';
}

interface Folder {
  id: number;
  name: string;
}

export default function ManageFolder({ token, onFolderManaged, mode }: ManageFolderProps) {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [newFolderName, setNewFolderName] = useState('');
  const [editingFolderId, setEditingFolderId] = useState<number | null>(null);
  const [editingFolderName, setEditingFolderName] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false); // 폴더 삭제 모달 상태
  const [folderToDelete, setFolderToDelete] = useState<number | null>(null); // 삭제할 폴더 ID

  const fetchFolders = async () => {
    try {
      const response = await getFolders(token);
      if (response.status === 200) {
        setFolders(response.body.data);
      } else {
        throw new Error(String(response.status));
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
      const response = await postFolders(token, newFolderName);
      if (response.status === 201) {
        setNewFolderName('');
        fetchFolders();
        onFolderManaged();
      } else {
        throw new Error(String(response.status));
      }
    } catch (error) {
      alert('폴더 생성 오류' + error);
      console.error('폴더 생성 오류', error);
    }
  };

  const handleEditFolder = async (folderId: number) => {
    if (editingFolderName.trim() === '') {
      alert('폴더 이름을 입력해주세요.');
      return;
    }
    try {
      const response = await putFolders(token, folderId, editingFolderName);
      if (response.status === 200) {
        setEditingFolderId(null);
        setEditingFolderName('');
        fetchFolders();
        onFolderManaged();
      } else {
        throw new Error(String(response.status));
      }
    } catch (error) {
      alert('폴더 수정 오류' + error);
      console.error('폴더 수정 오류', error);
    }
  };

  const handleDeleteFolder = async (folderId: number) => {
    try {
      const response = await deleteFolders(token, folderId);
      if (response.status === 200) {
        fetchFolders();
        onFolderManaged();
      } else {
        throw new Error(String(response.status));
      }
    } catch (error) {
      alert('폴더 삭제 오류' + error);
      console.error('폴더 삭제 오류', error);
    }
  };

  const confirmDeleteFolder = (folderId: number) => {
    setFolderToDelete(folderId);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    if (folderToDelete !== null) {
      handleDeleteFolder(folderToDelete);
    }
    setShowDeleteModal(false);
    setFolderToDelete(null);
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setFolderToDelete(null);
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
      {mode === 'add' ? (
        <FolderInputWrapper>
          <FolderAddInput
            type="text"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            placeholder="폴더 이름을 입력하세요."
          />
          <AddButton onClick={handleAddFolder}>확인</AddButton>
        </FolderInputWrapper>
      ) : (
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
                  <DeleteButton onClick={() => confirmDeleteFolder(folder.id)}>삭제</DeleteButton>
                </>
              )}
            </FolderItem>
          ))}
        </FolderList>
      )}
      {showDeleteModal && (
        <DeleteConfirmModal
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        />
      )}
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
  min-width: 300px;
  width: 50%;
  font-size: 14px;
`;

const FolderItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 24px;
  gap: 4px;
`;

const EditFolderWrapper = styled.div`
  display: flex;
  gap: 4px;
  width: 100%;
`;

const FolderEditInput = styled.input`
  flex-grow: 1;
  border-radius: 4px;
  border: 1px solid #ddd;
  padding-left: 4px;
`;

const FolderName = styled.span`
  flex-grow: 1;
`;

const EditButton = styled.div`
  background-color: #9CAFE2;
  color: white;
  border-radius: 4px;
  height: 24px;
  width: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const DeleteButton = styled.div`
  background-color: #9CAFE2;
  color: white;
  border-radius: 4px;
  height: 24px;
  width: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const SaveButton = styled.div`
  background-color: #9CAFE2;
  color: white;
  border-radius: 4px;
  height: 24px;
  width: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const CancelButton = styled.div`
  background-color: #9CAFE2;
  color: white;
  border-radius: 4px;
  height: 24px;
  width: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
`;
