import styled from 'styled-components';
import { useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import ScrapFolders from '../containers/save/ScrapFolders';
import ScrapContents from '../containers/save/ScrapContents';
import AddFolder from '../containers/save/AddFolder';
import { getFolders } from '../../utils/API/Folders';

interface Folder {
  id: number;
  name: string;
}

export default function MobileSavePage() {
  const token = useSelector((state: any) => state.user.token);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null);
  const [isAddingFolder, setIsAddingFolder] = useState(false); // 폴더 추가 상태

  const fetchFolders = async () => {
    try {
      const response = await getFolders(token);
      if (response.status === 200) {
        const allFolders = [{ id: 0, name: '전체' }, ...response.body.data];
        setFolders(allFolders);
        setSelectedFolder(allFolders[0]); // 기본 선택 폴더는 '전체'
      }
    } catch (error) {
      console.error('error');
    }
  };

  useEffect(() => {
    if (token) {
      fetchFolders();
    }
  }, [token]);

  const handleAddFolderClick = () => {
    setIsAddingFolder(true);
  };

  const handleFolderAdded = () => {
    setIsAddingFolder(false);
    fetchFolders();
  };

  const handleSelectFolder = (folder: Folder) => {
    setSelectedFolder(folder);
    setIsAddingFolder(false);
  };

  return (
    <MobileSavePageWrapper>
      {token ? (
        <>
          <ScrapFolders 
            folders={folders} 
            selectedFolder={selectedFolder}
            onSelectFolder={handleSelectFolder}
            onAddFolderClick={handleAddFolderClick} // 폴더 추가 버튼 클릭 핸들러
          />
          {isAddingFolder ? (
            <AddFolder token={token} onFolderAdded={handleFolderAdded} />
          ) : (
            <ScrapContents folder={selectedFolder} token={token} />
          )}
        </>
      ) : (
        <div>로그인이 필요합니다.</div>
      )}
    </MobileSavePageWrapper>
  );
}

const MobileSavePageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  height: 100%;
  width: 100%;
`;
