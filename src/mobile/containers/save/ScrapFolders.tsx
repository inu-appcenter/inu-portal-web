import styled from 'styled-components';
import Gear from '../../../resource/assets/mobile/save/Gear.svg';
import { useState } from 'react';
import FolderActionModal from './FolderActionModal';

interface ScrapFoldersProps {
  folders: { id: number; name: string }[];
  selectedFolder: { id: number; name: string } | null;
  onSelectFolder: (folder: { id: number; name: string }) => void;
  onManageFoldersClick: (mode: 'add' | 'manage') => void;
  isManagingFolders: boolean;
}

export default function ScrapFolders({ folders, selectedFolder, onSelectFolder, onManageFoldersClick, isManagingFolders }: ScrapFoldersProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);
  const handleAddFolder = () => {
    onManageFoldersClick('add');
    setIsModalOpen(false);
  };
  const handleManageFolders = () => {
    onManageFoldersClick('manage');
    setIsModalOpen(false);
  };

  return (
    <ScrapFoldersContainer>
      <ScrapFoldersWrapper>
        {folders.map((folder) => (
          <FolderWrapper key={folder.id}>
            <FolderItem 
              selected={selectedFolder?.id === folder.id}
              onClick={() => onSelectFolder(folder)}
            >
              {folder.name}
            </FolderItem>
            {selectedFolder?.id === folder.id && <SelectedBar />}
          </FolderWrapper>
        ))}
        <FolderWrapper>
          <ManageFolderButton onClick={handleOpenModal} selected={isManagingFolders}>
            <img src={Gear} />
          </ManageFolderButton>
          {isManagingFolders && <SelectedBar />}
        </FolderWrapper>
      </ScrapFoldersWrapper>
      <BottomBorder />
      {isModalOpen && (
        <FolderActionModal 
          onAddFolder={handleAddFolder} 
          onManageFolders={handleManageFolders} 
          onClose={handleCloseModal} 
        />
      )}
    </ScrapFoldersContainer>
  );
}

const ScrapFoldersContainer = styled.div`
  position: relative;
  width: 100%;
`;

const ScrapFoldersWrapper = styled.div`
  display: flex;
  align-items: center;
  width: 100svw;
  min-height: 42px;
  overflow-x: auto;

  /* Hide scrollbar for Chrome, Safari and Opera */
  &::-webkit-scrollbar {
    display: none;
  }

  /* Hide scrollbar for IE, Edge and Firefox */
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
`;

const BottomBorder = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: #E0E0E0;
  z-index: 1;
`;

const FolderWrapper = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const FolderItem = styled.div<{ selected: boolean }>`
  min-width: 100px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ selected }) => (selected ? '#4071B9' : '#000')};
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
`;

const ManageFolderButton = styled.div<{ selected: boolean }>`
  min-width: 100px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ selected }) => (selected ? '#4071B9' : '#E0E0E0')};
  font-size: 30px;
  font-weight: 500;
  cursor: pointer;
`;

const SelectedBar = styled.div`
  width: 100%;
  height: 2px;
  background-color: #4071B9;
  position: absolute;
  bottom: 0px;
  z-index: 10;
`;
